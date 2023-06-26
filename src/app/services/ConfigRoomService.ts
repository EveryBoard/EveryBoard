import { Injectable } from '@angular/core';
import { FirstPlayer, ConfigRoom, PartStatus, PartType } from '../domain/ConfigRoom';
import { ConfigRoomDAO } from '../dao/ConfigRoomDAO';
import { Debug, FirestoreJSONObject } from 'src/app/utils/utils';
import { MGPOptional } from '../utils/MGPOptional';
import { Subscription } from 'rxjs';
import { MGPValidation } from '../utils/MGPValidation';
import { MinimalUser } from '../domain/MinimalUser';
import { Localized } from '../utils/LocaleUtils';
import { ConnectedUserService } from './ConnectedUserService';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument, IFirestoreDAO } from '../dao/FirestoreDAO';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ConfigRoomService {

    public static VERBOSE: boolean = false;

    public static readonly GAME_DOES_NOT_EXIST: Localized = () => $localize`Game does not exist`;

    public constructor(private readonly configRoomDAO: ConfigRoomDAO,
                       private readonly connectedUserService: ConnectedUserService)
    {
    }
    public addCandidate(partId: string, candidate: MinimalUser): Promise<void> {
        return this.configRoomDAO.subCollectionDAO(partId, 'candidates').set(candidate.id, candidate);
    }
    public removeCandidate(partId: string, candidate: MinimalUser): Promise<void> {
        return this.configRoomDAO.subCollectionDAO(partId, 'candidates').delete(candidate.id);
    }
    public subscribeToChanges(configRoomId: string, callback: (doc: MGPOptional<ConfigRoom>) => void): Subscription {
        return this.configRoomDAO.subscribeToChanges(configRoomId, callback);
    }
    public subscribeToCandidates(configRoomId: string, callback: (candidates: MinimalUser[]) => void): Subscription {
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
        return subCollection.observingWhere([], observer);
    }
    public async createInitialConfigRoom(configRoomId: string): Promise<void> {
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
        return this.configRoomDAO.set(configRoomId, newConfigRoom);
    }
    public async joinGame(configRoomId: string): Promise<MGPValidation> {
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const configRoom: MGPOptional<ConfigRoom> = await this.configRoomDAO.read(configRoomId);
        if (configRoom.isAbsent()) {
            return MGPValidation.failure(ConfigRoomService.GAME_DOES_NOT_EXIST());
        } else {
            if (configRoom.get().creator.id !== user.id) {
                // Only add actual candidates to the game, not the creator
                await this.addCandidate(configRoomId, user);
            }
            return MGPValidation.SUCCESS;
        }
    }
    public async cancelJoining(configRoomId: string): Promise<void> {
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const configRoomOpt: MGPOptional<ConfigRoom> = await this.configRoomDAO.read(configRoomId);
        if (configRoomOpt.isAbsent()) {
            // The part does not exist, so we can consider that we succesfully cancelled joining
            return;
        } else {
            const configRoom: ConfigRoom = configRoomOpt.get();
            const configRoomUpdates: Promise<void>[] = [this.removeCandidate(configRoomId, user)];
            if (configRoom.chosenOpponent?.id === user.id) {
                // if the chosenOpponent leave, we're back to initial part creation
                const update: Partial<ConfigRoom> = {
                    chosenOpponent: null,
                    partStatus: PartStatus.PART_CREATED.value,
                };

                configRoomUpdates.push(this.configRoomDAO.update(configRoomId, update));
            }
            await Promise.all(configRoomUpdates);
        }
    }
    public async deleteConfigRoom(configRoomId: string, candidates: MinimalUser[]): Promise<void> {
        // We need to delete the candidates before the actual configRoom,
        // for the security rules to check that we are allowed to delete the configRoom
        await Promise.all(candidates.map((candidate: MinimalUser): Promise<void> =>
            this.removeCandidate(configRoomId, candidate)));
        await this.configRoomDAO.delete(configRoomId);
    }
    public async proposeConfig(configRoomId: string,
                               chosenOpponent: MinimalUser,
                               partType: PartType,
                               maximalMoveDuration: number,
                               firstPlayer: FirstPlayer,
                               totalPartDuration: number)
    : Promise<void>
    {
        return this.configRoomDAO.update(configRoomId, {
            partStatus: PartStatus.CONFIG_PROPOSED.value,
            chosenOpponent: chosenOpponent,
            partType: partType.value,
            maximalMoveDuration,
            totalPartDuration,
            firstPlayer: firstPlayer.value,
        });
    }
    public setChosenOpponent(configRoomId: string, chosenOpponent: MinimalUser): Promise<void> {
        return this.configRoomDAO.update(configRoomId, {
            chosenOpponent: chosenOpponent,
        });
    }
    public async reviewConfig(configRoomId: string): Promise<void> {
        return this.configRoomDAO.update(configRoomId, {
            partStatus: PartStatus.PART_CREATED.value,
        });
    }
    public async reviewConfigAndRemoveChosenOpponent(configRoomId: string): Promise<void> {
        return this.configRoomDAO.update(configRoomId, {
            partStatus: PartStatus.PART_CREATED.value,
            chosenOpponent: null,
        });
    }
    public acceptConfig(configRoomId: string): Promise<void> {
        return this.configRoomDAO.update(configRoomId, {
            partStatus: PartStatus.PART_STARTED.value,
        });
    }
    public async createConfigRoom(configRoomId: string, configRoom: ConfigRoom): Promise<void> {
        return this.configRoomDAO.set(configRoomId, configRoom);
    }
    public async readConfigRoomById(configRoomId: string): Promise<ConfigRoom> {
        return (await this.configRoomDAO.read(configRoomId)).get();
    }
}
