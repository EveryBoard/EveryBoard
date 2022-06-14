import { Injectable } from '@angular/core';
import { FirstPlayer, Joiner, PartStatus, PartType } from '../domain/Joiner';
import { JoinerDAO } from '../dao/JoinerDAO';
import { display, FirestoreJSONObject, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPOptional } from '../utils/MGPOptional';
import { Unsubscribe } from '@angular/fire/firestore';
import { MGPValidation } from '../utils/MGPValidation';
import { MinimalUser } from '../domain/MinimalUser';
import { ConnectedUserService } from './ConnectedUserService';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument, IFirestoreDAO } from '../dao/FirestoreDAO';

@Injectable({
    providedIn: 'root',
})
export class JoinerService {

    public static VERBOSE: boolean = false;

    private observedJoinerId: string | null;

    private joinerUnsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();
    private candidatesUnsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();

    public static readonly GAME_DOES_NOT_EXIST: () => string = () => $localize`Game does not exist`;

    constructor(private readonly joinerDAO: JoinerDAO,
                private readonly connectedUserService: ConnectedUserService)
    {
        display(JoinerService.VERBOSE, 'JoinerService.constructor');
    }
    public subscribeToChanges(joinerId: string, callback: (doc: MGPOptional<Joiner>) => void): void {
        this.observedJoinerId = joinerId;
        this.joinerUnsubscribe = MGPOptional.of(this.joinerDAO.subscribeToChanges(joinerId, callback));
    }
    public subscribeToCandidates(joinerId: string, callback: (candidates: MinimalUser[]) => void): void {
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
        const subCollection: IFirestoreDAO<FirestoreJSONObject> =
            this.joinerDAO.subCollectionDAO(joinerId, 'candidates');
        this.candidatesUnsubscribe = MGPOptional.of(subCollection.observingWhere([], observer));
    }
    public unsubscribe(): void {
        assert(this.joinerUnsubscribe.isPresent(), 'JoinerService cannot unsubscribe if no joiner is observed');
        assert(this.candidatesUnsubscribe.isPresent(), 'JoinerService cannot unsubscribe if no joiner is observed');
        this.joinerUnsubscribe.get()();
        this.joinerUnsubscribe = MGPOptional.empty();
        this.candidatesUnsubscribe.get()();
        this.candidatesUnsubscribe = MGPOptional.empty();
    }
    public async createInitialJoiner(joinerId: string): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.createInitialJoiner(' + joinerId + ')');

        const creator: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const newJoiner: Joiner = {
            chosenOpponent: null,
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
            totalPartDuration: PartType.NORMAL_PART_DURATION,
            creator,
        };
        return this.set(joinerId, newJoiner);
    }
    public async joinGame(partId: string): Promise<MGPValidation> {
        display(JoinerService.VERBOSE, 'JoinerService.joinGame(' + partId + ')');

        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const joiner: MGPOptional<Joiner> = await this.joinerDAO.read(partId);
        if (joiner.isAbsent()) {
            return MGPValidation.failure(JoinerService.GAME_DOES_NOT_EXIST());
        } else {
            if (joiner.get().creator.id !== user.id) {
                // Only add actual candidates to the game, not the creator
                await this.joinerDAO.addCandidate(partId, user);
            }
            return MGPValidation.SUCCESS;
        }
    }
    public async removeCandidate(candidate: MinimalUser): Promise<void> {
        assert(this.observedJoinerId != null, 'cannot remove candidate if not observing a joiner');
        return this.joinerDAO.removeCandidate(Utils.getNonNullable(this.observedJoinerId), candidate);
    }
    public async cancelJoining(): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.cancelJoining(); this.observedJoinerId = ' + this.observedJoinerId);

        if (this.observedJoinerId == null) {
            throw new Error('cannot cancel joining when not observing a joiner');
        }
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const joinerOpt: MGPOptional<Joiner> = await this.joinerDAO.read(this.observedJoinerId);
        if (joinerOpt.isAbsent()) {
            // The part does not exist, so we can consider that we succesfully cancelled joining
            return;
        } else {
            const joiner: Joiner = joinerOpt.get();
            let chosenOpponent: MinimalUser | null = joiner.chosenOpponent;
            let partStatus: number = joiner.partStatus;
            if (chosenOpponent?.id === user.id) {
                // if the chosenOpponent leave, we're back to initial part creation
                chosenOpponent = null;
                partStatus = PartStatus.PART_CREATED.value;
            }
            const update: Partial<Joiner> = {
                chosenOpponent: chosenOpponent,
                partStatus,
            };
            await this.joinerDAO.update(this.observedJoinerId, update);
            await this.joinerDAO.removeCandidate(this.observedJoinerId, user);
        }
    }
    public async deleteJoiner(candidates: MinimalUser[]): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.deleteJoiner(); this.observedJoinerId = ' + this.observedJoinerId);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');
        const joinerId: string = Utils.getNonNullable(this.observedJoinerId);
        await this.joinerDAO.delete(joinerId);
        for (const candidate of candidates) {
            await this.joinerDAO.removeCandidate(joinerId, candidate);
        }
    }
    public async proposeConfig(chosenOpponent: MinimalUser,
                               partType: PartType,
                               maximalMoveDuration: number,
                               firstPlayer: FirstPlayer,
                               totalPartDuration: number)
    : Promise<void>
    {
        display(JoinerService.VERBOSE,
                { joinerService_proposeConfig: { maximalMoveDuration, firstPlayer, totalPartDuration } });
        display(JoinerService.VERBOSE, 'this.followedJoinerId: ' + this.observedJoinerId);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), {
            partStatus: PartStatus.CONFIG_PROPOSED.value,
            chosenOpponent: chosenOpponent,
            partType: partType.value,
            maximalMoveDuration,
            totalPartDuration,
            firstPlayer: firstPlayer.value,
        });
    }
    public setChosenOpponent(chosenOpponent: MinimalUser): Promise<void> {
        display(JoinerService.VERBOSE, `JoinerService.setChosenOpponent(${chosenOpponent.name})`);

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), {
            chosenOpponent: chosenOpponent,
        });
    }
    public async reviewConfig(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), {
            partStatus: PartStatus.PART_CREATED.value,
        });
    }
    public async reviewConfigAndRemoveChosenOpponent(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), {
            partStatus: PartStatus.PART_CREATED.value,
            chosenOpponent: null,
        });
    }
    public acceptConfig(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.acceptConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), {
            partStatus: PartStatus.PART_STARTED.value,
        });
    }
    public async createJoiner(joiner: Joiner): Promise<string> {
        display(JoinerService.VERBOSE, 'JoinerService.create(' + JSON.stringify(joiner) + ')');

        return this.joinerDAO.create(joiner);
    }
    public async readJoinerById(partId: string): Promise<Joiner> {
        display(JoinerService.VERBOSE, 'JoinerService.readJoinerById(' + partId + ')');

        return (await this.joinerDAO.read(partId)).get();
    }
    public async set(partId: string, joiner: Joiner): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.set(' + partId + ', ' + JSON.stringify(joiner) + ')');

        return this.joinerDAO.set(partId, joiner);
    }
    public async updateJoinerById(partId: string, update: Partial<Joiner>): Promise<void> {
        display(JoinerService.VERBOSE, { joinerService_updateJoinerById: { partId, update } });

        return this.joinerDAO.update(partId, update);
    }
}
