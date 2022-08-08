import { Injectable } from '@angular/core';
import { FirstPlayer, ConfigRoom, PartStatus, PartType } from '../domain/ConfigRoom';
import { ConfigRoomDAO } from '../dao/ConfigRoomDAO';
import { display, FirestoreJSONObject, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPOptional } from '../utils/MGPOptional';
import { Unsubscribe } from '@angular/fire/firestore';
import { MGPValidation } from '../utils/MGPValidation';
import { MinimalUser } from '../domain/MinimalUser';
import { Localized } from '../utils/LocaleUtils';
import { ConnectedUserService } from './ConnectedUserService';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument, IFirestoreDAO } from '../dao/FirestoreDAO';

@Injectable({
    providedIn: 'root',
})
export class ConfigRoomService implements OnDestroy {

    public static VERBOSE: boolean = false;

    private observedConfigRoomId: MGPOptional<string> = MGPOptional.empty();

    private configRoomUnsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();
    private candidatesUnsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();

    public static readonly GAME_DOES_NOT_EXIST: Localized = () => $localize`Game does not exist`;

    constructor(private readonly configRoomDAO: ConfigRoomDAO,
                private readonly connectedUserService: ConnectedUserService)
    {
        display(ConfigRoomService.VERBOSE, 'ConfigRoomService.constructor');
    }
    public subscribeToChanges(configRoomId: string, callback: (doc: MGPOptional<ConfigRoom>) => void): void {
        this.observedConfigRoomId = MGPOptional.of(configRoomId);
        this.configRoomUnsubscribe = MGPOptional.of(this.configRoomDAO.subscribeToChanges(configRoomId, callback));
    }
    public subscribeToCandidates(configRoomId: string, callback: (candidates: MinimalUser[]) => void): void {
        let candidates: MinimalUser[] = [];
        const observer: FirestoreCollectionObserver<MinimalUser> = new FirestoreCollectionObserver(
            (created: FirestoreDocument<MinimalUser>[]) => {
                for (const candidate of created) {
                    candidates.push(candidate.data);
                }
                callback(candidates);
            },
            (modified: FirestoreDocument<MinimalUser>[]) => {
                // This should never happen, but we can still update the candidates list just in case
                for (const modifiedCandidate of modified) {
                    candidates = candidates.map((candidate: MinimalUser) => {
                        if (candidate.id === modifiedCandidate.data.id) {
                            return modifiedCandidate.data;
                        } else {
                            return candidate;
                        }
                    });
                }
                callback(candidates);
            },
            (deleted: FirestoreDocument<MinimalUser>[]) => {
                for (const deletedCandidate of deleted) {
                    candidates = candidates.filter((candidate: MinimalUser) =>
                        candidate.id !== deletedCandidate.data.id);
                }
                callback(candidates);
            });
        const subCollection: IFirestoreDAO<FirestoreJSONObject> = this.configRoomDAO.subCollectionDAO(configRoomId, 'candidates');
        this.candidatesUnsubscribe = MGPOptional.of(subCollection.observingWhere([], observer));
    }
    public unsubscribe(): void {
        assert(this.configRoomUnsubscribe.isPresent(), 'ConfigRoomService cannot unsubscribe if no configRoom is observed');
        assert(this.candidatesUnsubscribe.isPresent(), 'ConfigRoomService cannot unsubscribe if no configRoom is observed');
        this.configRoomUnsubscribe.get()();
        this.configRoomUnsubscribe = MGPOptional.empty();
        this.candidatesUnsubscribe.get()();
        this.candidatesUnsubscribe = MGPOptional.empty();
    }
    public async createInitialConfigRoom(configRoomId: string): Promise<void> {
        display(ConfigRoomService.VERBOSE, 'ConfigRoomService.createInitialConfigRoom(' + configRoomId + ')');

        const creator: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const newConfigRoom: ConfigRoom = {
            chosenOpponent: null,
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
            totalPartDuration: PartType.NORMAL_PART_DURATION,
            creator,
        };
        return this.set(configRoomId, newConfigRoom);
    }
    public async joinGame(partId: string): Promise<MGPValidation> {
        display(ConfigRoomService.VERBOSE, 'ConfigRoomService.joinGame(' + partId + ')');
        assert(this.observedConfigRoomId.isAbsent(), 'cannot join a game if already observing a configRoom');

        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const configRoom: MGPOptional<ConfigRoom> = await this.configRoomDAO.read(partId);
        if (configRoom.isAbsent()) {
            return MGPValidation.failure(ConfigRoomService.GAME_DOES_NOT_EXIST());
        } else {
            if (configRoom.get().creator.id !== user.id) {
                // Only add actual candidates to the game, not the creator
                await this.configRoomDAO.addCandidate(partId, user);
            }
            return MGPValidation.SUCCESS;
        }
    }
    public async removeCandidate(candidate: MinimalUser): Promise<void> {
        assert(this.observedConfigRoomId.isPresent(), 'cannot remove candidate if not observing a configRoom');
        return this.configRoomDAO.removeCandidate(Utils.getNonNullable(this.observedConfigRoomId), candidate);
    }
    public async cancelJoining(): Promise<void> {
        display(ConfigRoomService.VERBOSE,
                'ConfigRoomService.cancelJoining(); this.observedConfigRoomId = ' + this.observedConfigRoomId);
        assert(this.observedConfigRoomId.isPresent(), 'ConfigRoomService is not observing a configRoom');

        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const configRoomOpt: MGPOptional<ConfigRoom> = await this.configRoomDAO.read(this.observedConfigRoomId);
        if (configRoomOpt.isAbsent()) {
            // The part does not exist, so we can consider that we succesfully cancelled joining
            return;
        } else {
            const configRoom: ConfigRoom = configRoomOpt.get();
            if (configRoom.chosenOpponent?.id === user.id) {
                // if the chosenOpponent leave, we're back to initial part creation
                const update: Partial<ConfigRoom> = {
                    chosenOpponent: null,
                    partStatus: PartStatus.PART_CREATED.value,
                };
                await this.configRoomDAO.update(this.observedConfigRoomId, update);
            }
            await this.configRoomDAO.removeCandidate(this.observedConfigRoomId, user);
        }
    }
    public async deleteConfigRoom(candidates: MinimalUser[]): Promise<void> {
        display(ConfigRoomService.VERBOSE,
                'ConfigRoomService.deleteConfigRoom(); this.observedConfigRoomId = ' + this.observedConfigRoomId);
        assert(this.observedConfigRoomId.isPresent(), 'ConfigRoomService is not observing a configRoom');
        const configRoomId: string = Utils.getNonNullable(this.observedConfigRoomId);
        await this.configRoomDAO.delete(configRoomId);
        for (const candidate of candidates) {
            await this.configRoomDAO.removeCandidate(configRoomId, candidate);
        }
    }
    public async proposeConfig(chosenOpponent: MinimalUser,
                               partType: PartType,
                               maximalMoveDuration: number,
                               firstPlayer: FirstPlayer,
                               totalPartDuration: number)
    : Promise<void>
    {
        display(ConfigRoomService.VERBOSE,
                { configRoomService_proposeConfig: { maximalMoveDuration, firstPlayer, totalPartDuration } });
        display(ConfigRoomService.VERBOSE, 'this.followedConfigRoomId: ' + this.observedConfigRoomId);
        assert(this.observedConfigRoomId.isPresent(), 'ConfigRoomService is not observing a configRoom');

        return this.configRoomDAO.update(Utils.getNonNullable(this.observedConfigRoomId), {
            partStatus: PartStatus.CONFIG_PROPOSED.value,
            chosenOpponent: chosenOpponent,
            partType: partType.value,
            maximalMoveDuration,
            totalPartDuration,
            firstPlayer: firstPlayer.value,
        });
    }
    public setChosenOpponent(chosenOpponent: MinimalUser): Promise<void> {
        display(ConfigRoomService.VERBOSE, `ConfigRoomService.setChosenOpponent(${chosenOpponent.name})`);

        return this.configRoomDAO.update(Utils.getNonNullable(this.observedConfigRoomId), {
            chosenOpponent: chosenOpponent,
        });
    }
    public async reviewConfig(): Promise<void> {
        display(ConfigRoomService.VERBOSE, 'ConfigRoomService.reviewConfig');
        assert(this.observedConfigRoomId.isPresent(), 'ConfigRoomService is not observing a configRoom');

        return this.configRoomDAO.update(Utils.getNonNullable(this.observedConfigRoomId), {
            partStatus: PartStatus.PART_CREATED.value,
        });
    }
    public async reviewConfigAndRemoveChosenOpponent(): Promise<void> {
        display(ConfigRoomService.VERBOSE, 'ConfigRoomService.reviewConfig');
        assert(this.observedConfigRoomId.isPresent(), 'ConfigRoomService is not observing a configRoom');

        return this.configRoomDAO.update(Utils.getNonNullable(this.observedConfigRoomId), {
            partStatus: PartStatus.PART_CREATED.value,
            chosenOpponent: null,
        });
    }
    public acceptConfig(): Promise<void> {
        display(ConfigRoomService.VERBOSE, 'ConfigRoomService.acceptConfig');
        assert(this.observedConfigRoomId.isPresent(), 'ConfigRoomService is not observing a configRoom');

        return this.configRoomDAO.update(Utils.getNonNullable(this.observedConfigRoomId), {
            partStatus: PartStatus.PART_STARTED.value,
        });
    }
    public async createConfigRoom(partId: string, configRoom: ConfigRoom): Promise<void> {
        display(ConfigRoomService.VERBOSE, 'ConfigRoomService.create(' + JSON.stringify(configRoom) + ')');

        return this.configRoomDAO.set(partId, configRoom);
    }
    public async readConfigRoomById(partId: string): Promise<ConfigRoom> {
        display(ConfigRoomService.VERBOSE, 'ConfigRoomService.readConfigRoomById(' + partId + ')');

        return (await this.configRoomDAO.read(partId)).get();
    }
    public async set(partId: string, configRoom: ConfigRoom): Promise<void> {
        display(ConfigRoomService.VERBOSE, 'ConfigRoomService.set(' + partId + ', ' + JSON.stringify(configRoom) + ')');

        return this.configRoomDAO.set(partId, configRoom);
    }
    public async updateConfigRoomById(partId: string, update: Partial<ConfigRoom>): Promise<void> {
        display(ConfigRoomService.VERBOSE, { configRoomService_updateConfigRoomById: { partId, update } });

        return this.configRoomDAO.update(partId, update);
    }
    public ngOnDestroy(): void {
        assert(this.configRoomUnsubscribe.isAbsent(), 'JoinerService should have unsubscribed before being destroyed');
    }
}
