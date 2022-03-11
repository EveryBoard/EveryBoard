import { Injectable } from '@angular/core';
import { FirstPlayer, Joiner, PartStatus, PartType } from '../domain/Joiner';
import { JoinerDAO } from '../dao/JoinerDAO';
import { display } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { ArrayUtils } from '../utils/ArrayUtils';
import { MGPOptional } from '../utils/MGPOptional';
import { Unsubscribe } from '@angular/fire/firestore';
import { MGPValidation } from '../utils/MGPValidation';

@Injectable({
    providedIn: 'root',
})
export class JoinerService {
    public static VERBOSE: boolean = false;

    private observedJoinerId: string;

    private joinerUnsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();

    constructor(private readonly joinerDAO: JoinerDAO) {
        display(JoinerService.VERBOSE, 'JoinerService.constructor');
    }
    public subscribeToChanges(joinerId: string, callback: (doc: MGPOptional<Joiner>) => void): void {
        this.observedJoinerId = joinerId;
        this.joinerUnsubscribe = MGPOptional.of(this.joinerDAO.subscribeToChanges(joinerId, callback));
    }
    public unsubscribe(): void {
        assert(this.joinerUnsubscribe.isPresent(), 'JoinerService cannot unsubscribe if no joiner is observed');
        this.joinerUnsubscribe.get()();
        this.joinerUnsubscribe = MGPOptional.empty();
    }
    public async createInitialJoiner(creatorName: string, joinerId: string): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.createInitialJoiner(' + creatorName + ', ' + joinerId + ')');

        const newJoiner: Joiner = {
            candidates: [],
            chosenPlayer: null,
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
            totalPartDuration: PartType.NORMAL_PART_DURATION,
            creator: creatorName,
        };
        return this.set(joinerId, newJoiner);
    }
    public async joinGame(partId: string, userName: string): Promise<MGPValidation> {
        display(JoinerService.VERBOSE, 'JoinerService.joinGame(' + partId + ', ' + userName + ')');

        const joiner: MGPOptional<Joiner> = await this.joinerDAO.read(partId);
        if (joiner.isAbsent()) {
            return MGPValidation.failure('Game does not exist');
        }
        const joinerList: string[] = ArrayUtils.copyImmutableArray(joiner.get().candidates);
        if (joinerList.includes(userName)) {
            return MGPValidation.failure('User already in the game');
        } else if (userName === joiner.get().creator) {
            return MGPValidation.SUCCESS;
        } else {
            joinerList[joinerList.length] = userName;
            await this.joinerDAO.update(partId, { candidates: joinerList });
            return MGPValidation.SUCCESS;
        }
    }
    public async cancelJoining(userName: string): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.cancelJoining(' + userName + '); this.observedJoinerId = ' + this.observedJoinerId);

        if (this.observedJoinerId == null) {
            throw new Error('cannot cancel joining when not observing a joiner');
        }
        const joinerOpt: MGPOptional<Joiner> = await this.joinerDAO.read(this.observedJoinerId);
        if (joinerOpt.isAbsent()) {
            // The part does not exist, so we can consider that we succesfully cancelled joining
            return;
        } else {
            const joiner: Joiner = joinerOpt.get();
            const candidates: string[] = ArrayUtils.copyImmutableArray(joiner.candidates);
            const indexLeaver: number = candidates.indexOf(userName);
            let chosenPlayer: string | null = joiner.chosenPlayer;
            let partStatus: number = joiner.partStatus;
            candidates.splice(indexLeaver, 1); // remove player from candidates list
            if (chosenPlayer === userName) {
                // if the chosenPlayer leave, we're back to initial part creation
                chosenPlayer = null;
                partStatus = PartStatus.PART_CREATED.value;
            } else if (indexLeaver === -1) {
                throw new Error('someone that was not candidate nor chosenPlayer just left the chat: ' + userName);
            }
            const update: Partial<Joiner> = {
                chosenPlayer,
                partStatus,
                candidates,
            };
            return this.joinerDAO.update(this.observedJoinerId, update);
        }
    }
    public async updateCandidates(candidates: string[]): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');
        const update: Partial<Joiner> = { candidates };
        return this.joinerDAO.update(this.observedJoinerId, update);
    }
    public async deleteJoiner(): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.deleteJoiner(); this.observedJoinerId = ' + this.observedJoinerId);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');
        return this.joinerDAO.delete(this.observedJoinerId);
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

        return this.joinerDAO.update(this.observedJoinerId, {
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

        return this.joinerDAO.update(this.observedJoinerId, {
            chosenPlayer: player,
        });
    }
    public async reviewConfig(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(this.observedJoinerId, {
            partStatus: PartStatus.PART_CREATED.value,
        });
    }
    public async reviewConfigRemoveChosenPlayerAndUpdateCandidates(candidates: string[]): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(this.observedJoinerId, {
            partStatus: PartStatus.PART_CREATED.value,
            chosenPlayer: null,
            candidates,
        });
    }
    public acceptConfig(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.acceptConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(this.observedJoinerId, { partStatus: PartStatus.PART_STARTED.value });
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
