import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, Part, PartDocument } from '../domain/Part';
import { FirstPlayer, Joiner, PartStatus } from '../domain/Joiner';
import { JoinerService } from './JoinerService';
import { ChatService } from './ChatService';
import { Request } from '../domain/Request';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert, display, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { Time } from '../domain/Time';
import firebase from 'firebase/app';
import { MGPOptional } from '../utils/MGPOptional';

export interface StartingPartConfig extends Partial<Part> {
    playerZero: string,
    playerOne: string,
    turn: number,
    beginning?: firebase.firestore.FieldValue | Time,
}

@Injectable({
    providedIn: 'root',
})
export class GameService {

    public static VERBOSE: boolean = false;

    private followedPartId: MGPOptional<string> = MGPOptional.empty();

    /**
     * The outer optional is for when we haven't followed any part yet.
     * The inner optional is for when the part gets deleted
     */
    private followedPartObs: MGPOptional<Observable<MGPOptional<Part>>> = MGPOptional.empty();

    private followedPartSub: Subscription;

    constructor(private readonly partDAO: PartDAO,
                private readonly joinerService: JoinerService,
                private readonly chatService: ChatService)
    {
        display(GameService.VERBOSE, 'GameService.constructor');
    }
    public async getPartValidity(partId: string, gameType: string): Promise<MGPValidation> {
        const part: MGPOptional<Part> = await this.partDAO.read(partId);
        if (part.isAbsent()) {
            return MGPValidation.failure('NONEXISTENT_PART');
        }
        if (part.get().typeGame === gameType) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('WRONG_GAME_TYPE');
        }
    }
    private createUnstartedPart(creatorName: string, typeGame: string): Promise<string> {
        display(GameService.VERBOSE,
                'GameService.createPart(' + creatorName + ', ' + typeGame + ')');

        const newPart: Part = {
            typeGame,
            playerZero: creatorName,
            turn: -1,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
        };
        return this.partDAO.create(newPart);
    }
    private createChat(chatId: string): Promise<void> {
        display(GameService.VERBOSE, 'GameService.createChat(' + chatId + ')');

        return this.chatService.createNewChat(chatId);
    }
    public async createPartJoinerAndChat(creatorName: string, typeGame: string): Promise<string> {
        display(GameService.VERBOSE, 'GameService.createGame(' + creatorName + ', ' + typeGame + ')');

        const gameId: string = await this.createUnstartedPart(creatorName, typeGame);
        await this.joinerService.createInitialJoiner(creatorName, gameId);
        await this.createChat(gameId);
        return gameId;
    }

    private startGameWithConfig(partId: string, joiner: Joiner): Promise<void> {
        display(GameService.VERBOSE, 'GameService.startGameWithConfig(' + partId + ', ' + JSON.stringify(joiner));
        const modification: StartingPartConfig = this.getStartingConfig(joiner);
        return this.partDAO.update(partId, modification);
    }
    public getStartingConfig(joiner: Joiner): StartingPartConfig
    {
        let whoStarts: FirstPlayer = FirstPlayer.of(joiner.firstPlayer);
        if (whoStarts === FirstPlayer.RANDOM) {
            if (Math.random() < 0.5) {
                whoStarts = FirstPlayer.CREATOR;
            } else {
                whoStarts = FirstPlayer.CHOSEN_PLAYER;
            }
        }
        let playerZero: string;
        let playerOne: string;
        if (whoStarts === FirstPlayer.CREATOR) {
            playerZero = joiner.creator;
            playerOne = Utils.getNonNullable(joiner.chosenPlayer);
        } else {
            playerZero = Utils.getNonNullable(joiner.chosenPlayer);
            playerOne = joiner.creator;
        }
        return {
            playerZero,
            playerOne,
            turn: 0,
            beginning: firebase.firestore.FieldValue.serverTimestamp(),
            remainingMsForZero: joiner.totalPartDuration * 1000,
            remainingMsForOne: joiner.totalPartDuration * 1000,
        };
    }
    public async deletePart(partId: string): Promise<void> {
        display(GameService.VERBOSE, 'GameService.deletePart(' + partId + ')');
        return this.partDAO.delete(partId);
    }
    public async acceptConfig(partId: string, joiner: Joiner): Promise<void> {
        display(GameService.VERBOSE, { gameService_acceptConfig: { partId, joiner } });

        await this.joinerService.acceptConfig();
        return this.startGameWithConfig(partId, joiner);
    }
    // on OnlineGame Component

    public startObserving(partId: string, callback: (part: MGPOptional<Part>) => void): void {
        if (this.followedPartId.isAbsent()) {
            display(GameService.VERBOSE, '[start watching part ' + partId);

            this.followedPartId = MGPOptional.of(partId);
            this.followedPartObs = MGPOptional.of(this.partDAO.getObsById(partId));
            this.followedPartSub = this.followedPartObs.get().subscribe(callback);
        } else {
            throw new Error('GameService.startObserving should not be called while already observing a game');
        }
    }
    public resign(partId: string, winner: string, loser: string): Promise<void> {
        return this.partDAO.update(partId, {
            winner,
            loser,
            result: MGPResult.RESIGN.value,
            request: null,
        }); // resign
    }
    public notifyTimeout(partId: string, winner: string, loser: string): Promise<void> {
        return this.partDAO.update(partId, {
            winner,
            loser,
            result: MGPResult.TIMEOUT.value,
            request: null,
        });
    }
    public sendRequest(partId: string, request: Request): Promise<void> {
        return this.partDAO.update(partId, { request });
    }
    public proposeDraw(partId: string, player: Player): Promise<void> {
        return this.sendRequest(partId, Request.drawProposed(player));
    }
    public acceptDraw(partId: string): Promise<void> {
        return this.partDAO.update(partId, {
            result: MGPResult.DRAW.value,
            request: null,
        });
    }
    public refuseDraw(partId: string, player: Player): Promise<void> {
        return this.sendRequest(partId, Request.drawRefused(player));
    }
    public proposeRematch(partId: string, player: Player): Promise<void> {
        return this.sendRequest(partId, Request.rematchProposed(player));
    }
    public async acceptRematch(partDocument: PartDocument): Promise<void> {
        display(GameService.VERBOSE, { called: 'GameService.acceptRematch(', partDocument });
        const part: Part = Utils.getNonNullable(partDocument.data);

        const iJoiner: Joiner = await this.joinerService.readJoinerById(partDocument.id);
        let firstPlayer: FirstPlayer;
        if (part.playerZero === iJoiner.creator) {
            firstPlayer = FirstPlayer.CHOSEN_PLAYER; // so he won't start this one
        } else {
            firstPlayer = FirstPlayer.CREATOR;
        }
        const newJoiner: Joiner = {
            ...iJoiner, // 5 attributes unchanged

            candidates: [], // they'll join again when the component reload

            firstPlayer: firstPlayer.value, // first player changed so the other one starts
            partStatus: PartStatus.PART_STARTED.value, // game ready to start
        };
        const rematchId: string = await this.joinerService.createJoiner(newJoiner);
        const startingConfig: StartingPartConfig = this.getStartingConfig(newJoiner);
        const newPart: Part = {
            typeGame: part.typeGame,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
            ...startingConfig,
        };
        await this.partDAO.set(rematchId, newPart);
        await this.createChat(rematchId);
        return this.sendRequest(partDocument.id, Request.rematchAccepted(part.typeGame, rematchId));
    }
    public askTakeBack(partId: string, player: Player): Promise<void> {
        return this.sendRequest(partId, Request.takeBackAsked(player));
    }
    public async acceptTakeBack(id: string, part: PartDocument, observerRole: Player, msToSubstract: [number, number])
    : Promise<void>
    {
        assert(observerRole !== Player.NONE, 'Illegal for observer to make request');
        const requester: Player = Request.getPlayer(Utils.getNonNullable(part.data.request));
        assert(requester !== observerRole, 'Illegal to accept your own request.');

        const request: Request = Request.takeBackAccepted(observerRole);
        let listMoves: JSONValueWithoutArray[] = part.data.listMoves.slice(0, part.data.listMoves.length - 1);
        if (listMoves.length % 2 === observerRole.value) {
            // Deleting a second move
            listMoves = listMoves.slice(0, listMoves.length - 1);
        }
        const update: Partial<Part> = {
            request,
            listMoves,
            turn: listMoves.length,
            lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
            remainingMsForZero: Utils.getNonNullable(part.data.remainingMsForZero) - msToSubstract[0],
            remainingMsForOne: Utils.getNonNullable(part.data.remainingMsForOne) - msToSubstract[1],
        };
        return await this.partDAO.update(id, update);
    }
    public refuseTakeBack(id: string, observerRole: Player): Promise<void> {
        assert(observerRole !== Player.NONE, 'Illegal for observer to make request');

        const request: Request = Request.takeBackRefused(observerRole);
        return this.partDAO.update(id, {
            request,
        });
    }
    public stopObserving(): void {
        display(GameService.VERBOSE, 'GameService.stopObserving();');

        assert(this.followedPartId.isPresent(), '!!! GameService.stopObserving: we already stop watching doc');

        display(GameService.VERBOSE, 'stopped watching joiner ' + this.followedPartId + ']');

        this.followedPartId = MGPOptional.empty();
        this.followedPartSub.unsubscribe();
        this.followedPartObs = MGPOptional.empty();
    }
    public async updateDBBoard(partId: string,
                               encodedMove: JSONValueWithoutArray,
                               msToSubstract: [number, number],
                               scores?: [number, number],
                               notifyDraw?: boolean,
                               winner?: string,
                               loser?: string)
    : Promise<void>
    {
        display(GameService.VERBOSE, { gameService_updateDBBoard: {
            partId, encodedMove, scores, msToSubstract, notifyDraw, winner, loser } });

        const part: Part = (await this.partDAO.read(partId)).get(); // TODO: optimise this
        const turn: number = part.turn + 1;
        const listMoves: JSONValueWithoutArray[] = ArrayUtils.copyImmutableArray(part.listMoves);
        listMoves[listMoves.length] = encodedMove;
        let update: Partial<Part> = {
            listMoves,
            turn,
            request: null,
            lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
        };
        if (scores !== undefined) {
            update = {
                ...update,
                scorePlayerZero: scores[0],
                scorePlayerOne: scores[1],
            };
        }
        if (msToSubstract[0] > 0) {
            update = {
                ...update,
                remainingMsForZero: Utils.getNonNullable(part.remainingMsForZero) - msToSubstract[0],
            };
        }
        if (msToSubstract[1] > 0) {
            update = {
                ...update,
                remainingMsForOne: Utils.getNonNullable(part.remainingMsForOne) - msToSubstract[1],
            };
        }
        if (winner != null) {
            update = {
                ...update,
                winner,
                loser,
                result: MGPResult.VICTORY.value,
            };
        } else if (notifyDraw === true) {
            update = {
                ...update,
                result: MGPResult.DRAW.value,
            };
        }
        return await this.partDAO.update(partId, update);
    }
}
