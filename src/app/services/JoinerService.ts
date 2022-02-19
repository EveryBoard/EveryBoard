import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirstPlayer, Joiner, MinimalUser, PartStatus, PartType } from '../domain/Joiner';
import { JoinerDAO } from '../dao/JoinerDAO';
import { assert, display } from 'src/app/utils/utils';
import { ArrayUtils } from '../utils/ArrayUtils';
import { MGPOptional } from '../utils/MGPOptional';
import { MGPValidation } from '../utils/MGPValidation';

@Injectable({
    providedIn: 'root',
})
export class JoinerService {

    public static VERBOSE: boolean = true;

    private observedJoinerId: string;

    constructor(private readonly joinerDAO: JoinerDAO) {
        display(JoinerService.VERBOSE, 'JoinerService.constructor');
    }
    public observe(joinerId: string): Observable<MGPOptional<Joiner>> {
        this.observedJoinerId = joinerId;
        return this.joinerDAO.getObsById(joinerId);
    }
    public async createInitialJoiner(creator: MinimalUser, joinerId: string): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.createInitialJoiner(' + creator + ', ' + joinerId + ')');

        const newJoiner: Joiner = {
            candidates: [],
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
        display(JoinerService.VERBOSE, 'JoinerService.joinGame(' + partId + ', ' + user.id + ')');

        const joiner: MGPOptional<Joiner> = await this.joinerDAO.read(partId);
        if (joiner.isAbsent()) {
            return MGPValidation.failure('Game does not exist');
        }
        const joinerList: MinimalUser[] = ArrayUtils.copyImmutableArray(joiner.get().candidates);
        if (joinerList.some((minimalUser: MinimalUser) => minimalUser.id === user.id)) {
            return MGPValidation.failure('User already in the game');
        } else if (user.id === joiner.get().creator.id) {
            return MGPValidation.SUCCESS;
        } else {
            joinerList[joinerList.length] = user;
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
            const candidates: MinimalUser[] = ArrayUtils.copyImmutableArray(joiner.candidates);
            const indexLeaver: number = candidates.findIndex((user: MinimalUser) => user.name === userName);
            let chosenPlayer: string | null = joiner.chosenPlayer;
            let partStatus: number = joiner.partStatus;
            candidates.splice(indexLeaver, 1); // remove player from candidates list
            if (chosenPlayer === userName) {
                // if the chosenPlayer leave, we're back to initial part creation
                chosenPlayer = null;
                partStatus = PartStatus.PART_CREATED.value;
            } else if (indexLeaver === -1) {
                console.log('ERROR::: someone that was not candidate nor chosenPlayer just left the chat: ' + userName);
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
    public async updateCandidates(candidates: MinimalUser[]): Promise<void> {
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
    public setChosenPlayer(chosenPlayerName: string): Promise<void> {
        display(JoinerService.VERBOSE, `JoinerService.setChosenPlayer(${chosenPlayerName})`);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(this.observedJoinerId, {
            chosenPlayer: chosenPlayerName,
        });
    }
    public async reviewConfig(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(this.observedJoinerId, {
            partStatus: PartStatus.PART_CREATED.value,
        });
    }
    public async reviewConfigRemoveChosenPlayerAndUpdateCandidates(candidates: MinimalUser[]): Promise<void> {
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
