import { Injectable } from '@angular/core';
import { FirstPlayer, Joiner, PartStatus, PartType } from '../domain/Joiner';
import { JoinerDAO } from '../dao/JoinerDAO';
import { display, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPOptional } from '../utils/MGPOptional';
import { Unsubscribe } from '@angular/fire/firestore';
import { MGPValidation } from '../utils/MGPValidation';
import { MinimalUser } from '../domain/MinimalUser';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { FirebaseDocument } from '../dao/FirebaseFirestoreDAO';

@Injectable({
    providedIn: 'root',
})
export class JoinerService {
    public static VERBOSE: boolean = false;

    private observedJoinerId: string | null;

    private joinerUnsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();
    private candidatesUnsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();

    constructor(private readonly joinerDAO: JoinerDAO) {
        display(JoinerService.VERBOSE, 'JoinerService.constructor');
    }
    public subscribeToChanges(joinerId: string, callback: (doc: MGPOptional<Joiner>) => void): void {
        this.observedJoinerId = joinerId;
        this.joinerUnsubscribe = MGPOptional.of(this.joinerDAO.subscribeToChanges(joinerId, callback));
    }
    public subscribeToCandidates(joinerId: string, callback: (candidates: MinimalUser[]) => void): void {
        let candidates: MinimalUser[] = [];
        const observer: FirebaseCollectionObserver<MinimalUser> = new FirebaseCollectionObserver(
            (created: FirebaseDocument<MinimalUser>[]) => {
                for (const candidate of created) {
                    candidates.push(candidate.data);
                }
                callback(candidates);
            },
            (modified: FirebaseDocument<MinimalUser>[]) => {
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
            (deleted: FirebaseDocument<MinimalUser>[]) => {
                for (const deletedCandidate of deleted) {
                    candidates = candidates.filter((candidate: MinimalUser) =>
                        candidate.id !== deletedCandidate.data.id);
                }
                callback(candidates);
            });
        this.candidatesUnsubscribe = MGPOptional.of(this.joinerDAO.subCollectionDAO(joinerId, 'candidates').observingWhere([], observer));
    }
    public unsubscribe(): void {
        assert(this.joinerUnsubscribe.isPresent(), 'JoinerService cannot unsubscribe if no joiner is observed');
        assert(this.candidatesUnsubscribe.isPresent(), 'JoinerService cannot unsubscribe if no joiner is observed');
        this.joinerUnsubscribe.get()();
        this.joinerUnsubscribe = MGPOptional.empty();
        this.candidatesUnsubscribe.get()();
        this.candidatesUnsubscribe = MGPOptional.empty();
    }
    // TODO FOR REVIEW: wouldn't the joiner service be much simpler to use if: all functions that take a user instead rely on the currently logged in user? 
    public async createInitialJoiner(creator: MinimalUser, joinerId: string): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.createInitialJoiner(' + creator.id + ', ' + joinerId + ')');

        const newJoiner: Joiner = {
            chosenPlayer: null,
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
            totalPartDuration: PartType.NORMAL_PART_DURATION,
            creator,
        };
        return this.set(joinerId, newJoiner);
    }
    public async joinGame(partId: string, user: MinimalUser): Promise<MGPValidation> {
        display(JoinerService.VERBOSE, 'JoinerService.joinGame(' + partId + ', ' + user.name + ')');

        const joiner: MGPOptional<Joiner> = await this.joinerDAO.read(partId);
        if (joiner.isAbsent()) {
            return MGPValidation.failure('Game does not exist');
        } else {
            if (joiner.get().creator.id !== user.id) {
                // Only add actual candidates to the game, not the creator
                await this.joinerDAO.addCandidate(partId, user);
            }
            return MGPValidation.SUCCESS;
        }
    }
    public async removeCandidate(user: MinimalUser): Promise<void> {
        if (this.observedJoinerId == null) {
            throw new Error('cannot remove candidate when not observing a joiner');
        }
        return this.joinerDAO.subCollectionDAO(this.observedJoinerId, 'candidates').delete(user.id);
    }
    public async cancelJoining(user: MinimalUser): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.cancelJoining(' + user.name + '); this.observedJoinerId = ' + this.observedJoinerId);

        if (this.observedJoinerId == null) {
            throw new Error('cannot cancel joining when not observing a joiner');
        }
        const joinerOpt: MGPOptional<Joiner> = await this.joinerDAO.read(this.observedJoinerId);
        if (joinerOpt.isAbsent()) {
            // The part does not exist, so we can consider that we succesfully cancelled joining
            return;
        } else {
            const joiner: Joiner = joinerOpt.get();
            let chosenPlayer: string | null = joiner.chosenPlayer;
            let partStatus: number = joiner.partStatus;
            if (chosenPlayer === user.name) {
                // if the chosenPlayer leave, we're back to initial part creation
                chosenPlayer = null;
                partStatus = PartStatus.PART_CREATED.value;
            }
            const update: Partial<Joiner> = {
                chosenPlayer,
                partStatus,
            };
            await this.joinerDAO.update(this.observedJoinerId, update);
            await this.joinerDAO.removeCandidate(this.observedJoinerId, user);
        }
    }
    public async deleteJoiner(): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.deleteJoiner(); this.observedJoinerId = ' + this.observedJoinerId);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');
        return this.joinerDAO.delete(Utils.getNonNullable(this.observedJoinerId));
    }
    public async proposeConfig(chosenPlayer: string,
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
            chosenPlayer,
            partType: partType.value,
            maximalMoveDuration,
            totalPartDuration,
            firstPlayer: firstPlayer.value,
        });
    }
    public setChosenPlayer(player: string): Promise<void> {
        display(JoinerService.VERBOSE, `JoinerService.setChosenPlayer(${player})`);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), {
            chosenPlayer: player,
        });
    }
    public async reviewConfig(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), {
            partStatus: PartStatus.PART_CREATED.value,
        });
    }
    public async reviewConfigAndRemoveChosenPlayer(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), {
            partStatus: PartStatus.PART_CREATED.value,
            chosenPlayer: null,
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
