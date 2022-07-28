import { Injectable } from '@angular/core';
import { FirstPlayer, Joiner, PartStatus, PartType } from '../domain/Joiner';
import { JoinerDAO } from '../dao/JoinerDAO';
import { display, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { ArrayUtils } from '../utils/ArrayUtils';
import { MGPOptional } from '../utils/MGPOptional';
import { Unsubscribe } from '@angular/fire/firestore';
import { MGPValidation } from '../utils/MGPValidation';
import { MinimalUser } from '../domain/MinimalUser';
import { Localized } from '../utils/LocaleUtils';
import { ConnectedUserService } from './ConnectedUserService';

@Injectable({
    providedIn: 'root',
})
export class JoinerService {

    public static VERBOSE: boolean = false;

    private observedJoinerId: string | null;

    private joinerUnsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();

    public static readonly GAME_DOES_NOT_EXIST: Localized = () => $localize`Game does not exist`;

    constructor(private readonly joinerDAO: JoinerDAO,
                private readonly connectedUserService: ConnectedUserService)
    {
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
    public async createInitialJoiner(creator: MinimalUser, joinerId: string): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.createInitialJoiner(' + creator.id + ', ' + joinerId + ')');

        const newJoiner: Joiner = {
            candidates: [],
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
        }
        const candidates: MinimalUser[] = ArrayUtils.copyImmutableArray(joiner.get().candidates);
        if (candidates.some((minimalUser: MinimalUser) => minimalUser.id === user.id) ||
            user.id === joiner.get().creator.id)
        {
            return MGPValidation.SUCCESS;
        } else {
            candidates[candidates.length] = user;
            await this.joinerDAO.update(partId, { candidates: candidates });
            return MGPValidation.SUCCESS;
        }
    }
    public async cancelJoining(): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.cancelJoining(); this.observedJoinerId = ' + this.observedJoinerId);

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
            const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
            const indexLeaver: number = candidates.findIndex((u: MinimalUser) => u.id === user.id);
            assert(indexLeaver >= 0, 'someone that was not candidate (probably creator) just left the chat: ' + user.name);
            let chosenOpponent: MinimalUser | null = joiner.chosenOpponent;
            let partStatus: number = joiner.partStatus;
            if (chosenOpponent?.id === user.id) {
                // if the ChosenOpponent left, we're back to initial part creation
                chosenOpponent = null;
                partStatus = PartStatus.PART_CREATED.value;
            }
            candidates.splice(indexLeaver, 1); // remove player from candidates list
            const update: Partial<Joiner> = {
                chosenOpponent: chosenOpponent,
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
        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), update);
    }
    public async deleteJoiner(): Promise<void> {
        display(JoinerService.VERBOSE,
                'JoinerService.deleteJoiner(); this.observedJoinerId = ' + this.observedJoinerId);
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');
        return this.joinerDAO.delete(Utils.getNonNullable(this.observedJoinerId));
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
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

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
    public async reviewConfigAndRemoveChosenOpponentAndUpdateCandidates(candidates: MinimalUser[]): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.reviewConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId), {
            partStatus: PartStatus.PART_CREATED.value,
            candidates,
            chosenOpponent: null,
        });
    }
    public acceptConfig(): Promise<void> {
        display(JoinerService.VERBOSE, 'JoinerService.acceptConfig');
        assert(this.observedJoinerId != null, 'JoinerService is not observing a joiner');

        return this.joinerDAO.update(Utils.getNonNullable(this.observedJoinerId),
                                     { partStatus: PartStatus.PART_STARTED.value });
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
