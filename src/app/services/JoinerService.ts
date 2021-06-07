import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FirstPlayer, IJoiner, IJoinerId, IPartType, PartStatus, PartType } from '../domain/ijoiner';
import { JoinerDAO } from '../dao/JoinerDAO';
import { assert, display } from 'src/app/utils/utils';
import { ArrayUtils } from '../utils/ArrayUtils';

@Injectable({
    providedIn: 'root',
})
export class JoinerService {
    public static VERBOSE: boolean = false;

    public static readonly EMPTY_JOINER: IJoiner = {
        creator: null,
        candidates: [],
        chosenPlayer: '',
        firstPlayer: FirstPlayer.CREATOR.value, // by default: creator
        partStatus: PartStatus.PART_CREATED.value,
    };

    private observedJoinerId: string;
    private observedJoinerObs: Observable<IJoinerId>;
    private observedJoinerSub: Subscription;

    constructor(private joinerDao: JoinerDAO) {
        display(JoinerService.VERBOSE, 'JoinerService.constructor');
    }
    public observe(joinerId: string): Observable<IJoinerId> {
        return this.joinerDao.getObsById(joinerId);
    }
    public startObserving(joinerId: string, callback: (iJoinerId: IJoinerId) => void): void {
        display(JoinerService.VERBOSE, 'JoinerService.startObserving ' + joinerId);

        if (this.observedJoinerId == null) {
            display(JoinerService.VERBOSE, '[start observing joiner ' + joinerId);

            this.observedJoinerId = joinerId;
            this.observedJoinerObs = this.joinerDao.getObsById(joinerId);
            this.observedJoinerSub = this.observedJoinerObs
                .subscribe((joinerId: IJoinerId) => callback(joinerId));
        } else {
            throw new Error('JoinerService.startObserving should not be called while already observing a joiner');
        }
    }
    public async createInitialJoiner(creatorName: string, joinerId: string): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.createInitialJoiner(' + creatorName + ', ' + joinerId + ')');

        const newJoiner: IJoiner = {
            ...JoinerService.EMPTY_JOINER,
            creator: creatorName,
        };
        return this.set(joinerId, newJoiner);
    }
    public async joinGame(partId: string, userName: string): Promise<boolean> {
        display(JoinerService.VERBOSE, 'JoinerService.joinGame(' + partId + ', ' + userName + ')');

        const joiner: IJoiner = await this.joinerDao.read(partId);
        if (joiner == null) {
            return false;
        }
        const joinerList: string[] = ArrayUtils.copyImmutableArray(joiner.candidates);
        if (joinerList.includes(userName)) {
            // Player probably opened a second tab, he can do that but he does not join a game twice
            return true;
        } else if (userName === joiner.creator) {
            return true;
        } else {
            joinerList[joinerList.length] = userName;
            await this.joinerDao.update(partId, { candidates: joinerList });
        }
    }
    public async cancelJoining(userName: string): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.cancelJoining(' + userName + '); this.observedJoinerId =' + this.observedJoinerId);

        if (this.observedJoinerId == null) {
            throw new Error('cannot cancel joining when not observing a joiner');
        }
        const joiner: IJoiner = await this.joinerDao.read(this.observedJoinerId);
        if (joiner == null) {
            // When can this ever happen? We should have joined the game and then the game has been deleted?
            throw new Error('DAO Did not found a joiner with id ' + this.observedJoinerId);
        } else {
            const candidates: string[] = ArrayUtils.copyImmutableArray(joiner.candidates);
            const indexLeaver: number = candidates.indexOf(userName);
            let chosenPlayer: string = joiner.chosenPlayer;
            let partStatus: number = joiner.partStatus;
            candidates.splice(indexLeaver, 1); // remove player from candidates list
            if (chosenPlayer === userName) {
                // if the chosenPlayer leave, we're back to initial part creation
                chosenPlayer = '';
                partStatus = PartStatus.PART_CREATED.value;
            } else if (indexLeaver === -1) {
                throw new Error('someone that was nor candidate nor chosenPlayer just left the chat: ' + userName);
            }
            const modification: Partial<IJoiner> = {
                chosenPlayer,
                partStatus,
                candidates,
            };
            return this.joinerDao.update(this.observedJoinerId, modification);
        }
    }

    public async updateCandidates(candidates: string[]): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');
        const modification: Partial<IJoiner> = { candidates };
        return this.joinerDao.update(this.observedJoinerId, modification);
    }
    public async deleteJoiner(): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.deleteJoiner(); this.observedJoinerId = ' + this.observedJoinerId);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');
        return this.joinerDao.delete(this.observedJoinerId);
    }
    public async proposeConfig(chosenPlayerPseudo: string,
                               partType: PartType,
                               maximalMoveDuration: number,
                               firstPlayer: FirstPlayer,
                               totalPartDuration: number)
    : Promise<void> {
        display(JoinerService.VERBOSE,
                { joinerService_proposeConfig: { maximalMoveDuration, firstPlayer, totalPartDuration } });
        display(JoinerService.VERBOSE, 'this.followedJoinerId: ' + this.observedJoinerId);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDao.update(this.observedJoinerId, {
            partStatus: PartStatus.CONFIG_PROPOSED.value,
            chosenPlayer: chosenPlayerPseudo,
            partType: partType.value,
            maximalMoveDuration,
            totalPartDuration,
            firstPlayer: firstPlayer.value,
        });
    }
    public setChosenPlayer(player: string): Promise<void> {
        display(JoinerService.VERBOSE, `JoinerService.setChosenPlayer(${player})`);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDao.update(this.observedJoinerId, {
            chosenPlayer: player,
        });
    }
    public async reviewConfig(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDao.update(this.observedJoinerId, {
            partStatus: PartStatus.PART_CREATED.value,
        });
    }
    public async reviewConfigRemoveChosenPlayerAndUpdateCandidates(candidates: string[]): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDao.update(this.observedJoinerId, {
            partStatus: PartStatus.PART_CREATED.value,
            chosenPlayer: '',
            candidates,
        });
    }
    public acceptConfig(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.acceptConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDao.update(this.observedJoinerId, { partStatus: PartStatus.PART_STARTED.value });
    }
    public stopObserving(): void {
        display(JoinerService.VERBOSE,
                'JoinerService.stopObserving(); // this.observedJoinerId = ' + this.observedJoinerId);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        this.observedJoinerId = null;
        this.observedJoinerSub.unsubscribe();
        this.observedJoinerObs = null;
    }
    public async readJoinerById(partId: string): Promise<IJoiner> {
        display(JoinerService.VERBOSE, 'JoinerService.readJoinerById(' + partId + ')');

        return this.joinerDao.read(partId);
    }
    public async set(partId: string, joiner: IJoiner): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.set(' + partId + ', ' + JSON.stringify(joiner) + ')');

        return this.joinerDao.set(partId, joiner);
    }
    public async updateJoinerById(partId: string, update: Partial<IJoiner>): Promise<void> {
        display(JoinerService.VERBOSE, { joinerService_updateJoinerById: { partId, update } });

        return this.joinerDao.update(partId, update);
    }
}
