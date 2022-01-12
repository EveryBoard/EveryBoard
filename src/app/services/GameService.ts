import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, ICurrentPartId, IPart, Part } from '../domain/icurrentpart';
import { FirstPlayer, IJoiner, PartStatus } from '../domain/ijoiner';
import { JoinerService } from './JoinerService';
import { ActivesPartsService } from './ActivesPartsService';
import { ChatService } from './ChatService';
import { Request } from '../domain/request';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert, display, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { AuthenticationService, AuthUser } from './AuthenticationService';
import { MessageDisplayer } from './message-displayer/MessageDisplayer';
import { GameServiceMessages } from './GameServiceMessages';
import { Time } from '../domain/Time';
import firebase from 'firebase/app';
import { MGPOptional } from '../utils/MGPOptional';

export interface StartingPartConfig extends Partial<IPart> {
    playerZero: string,
    playerOne: string,
    turn: number,
    beginning?: firebase.firestore.FieldValue | Time,
}

@Injectable({
    providedIn: 'root',
})
export class GameService implements OnDestroy {

    public static VERBOSE: boolean = false;

    private followedPartId: MGPOptional<string> = MGPOptional.empty();

    private followedPartObs: MGPOptional<Observable<ICurrentPartId>> = MGPOptional.empty();

    private followedPartSub: Subscription;

    private readonly userNameSub: Subscription;

    private userName: MGPOptional<string>;

    constructor(private readonly partDAO: PartDAO,
                private readonly activesPartsService: ActivesPartsService,
                private readonly joinerService: JoinerService,
                private readonly chatService: ChatService,
                private readonly router: Router,
                private readonly messageDisplayer: MessageDisplayer,
                private readonly authenticationService: AuthenticationService)
    {
        display(GameService.VERBOSE, 'GameService.constructor');
        this.userNameSub = this.authenticationService.getUserObs()
            .subscribe((joueur: AuthUser) => {
                this.userName = joueur.username;
            });
    }
    public async createGameAndRedirectOrShowError(game: string): Promise<boolean> {
        if (this.isUserOffline()) {
            this.messageDisplayer.infoMessage(GameServiceMessages.USER_OFFLINE());
            this.router.navigate(['/login']);
            return false;
        } else if (this.canCreateGame() === true && this.userName.isPresent()) {
            const gameId: string = await this.createPartJoinerAndChat(this.userName.get(), game);
            // create Part and Joiner
            this.router.navigate(['/play/' + game, gameId]);
            return true;
        } else {
            this.messageDisplayer.infoMessage(GameServiceMessages.ALREADY_INGAME());
            this.router.navigate(['/server']);
            return false;
        }
    }
    public isUserOffline(): boolean {
        return this.userName.isAbsent();
    }
    public ngOnDestroy(): void {
        this.userNameSub.unsubscribe();
    }
    public async getPartValidity(partId: string, gameType: string): Promise<MGPValidation> {
        const part: MGPOptional<IPart> = await this.partDAO.read(partId);
        if (part.isAbsent()) {
            return MGPValidation.failure('NONEXISTENT_PART');
        }
        if (part.get().typeGame === gameType) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('WRONG_GAME_TYPE');
        }
    }
    protected createUnstartedPart(creatorName: string, typeGame: string): Promise<string> {
        display(GameService.VERBOSE,
                'GameService.createPart(' + creatorName + ', ' + typeGame + ')');

        const newPart: IPart = {
            lastUpdate: {
                index: 0,
                player: 0,
            },
            typeGame,
            playerZero: creatorName,
            turn: -1,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
        };
        return this.partDAO.create(newPart);
    }
    protected createChat(chatId: string): Promise<void> {
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
    public canCreateGame(): boolean {
        return this.userName.isPresent() && this.activesPartsService.hasActivePart(this.userName.get()) === false;
    }
    public unSubFromActivesPartsObs(): void {
        display(GameService.VERBOSE, 'GameService.unSubFromActivesPartsObs()');

        this.activesPartsService.stopObserving();
    }
    private startGameWithConfig(partId: string, user: Player, lastIndex: number, joiner: IJoiner): Promise<void> {
        display(GameService.VERBOSE, 'GameService.startGameWithConfig(' + partId + ', ' + JSON.stringify(joiner));
        const update: StartingPartConfig = this.getStartingConfig(joiner);
        return this.partDAO.updateAndBumpIndex(partId, user, lastIndex, update);
    }
    public getStartingConfig(joiner: IJoiner): StartingPartConfig
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
    public async acceptConfig(partId: string, joiner: IJoiner): Promise<void> {
        display(GameService.VERBOSE, { gameService_acceptConfig: { partId, joiner } });

        await this.joinerService.acceptConfig();
        return this.startGameWithConfig(partId, Player.ONE, 0, joiner);
    }
    public startObserving(partId: string, callback: (iPart: ICurrentPartId) => void): void {
        if (this.followedPartId.isAbsent()) {
            display(GameService.VERBOSE, '[start watching part ' + partId);

            this.followedPartId = MGPOptional.of(partId);
            this.followedPartObs = MGPOptional.of(this.partDAO.getObsById(partId));
            this.followedPartSub = this.followedPartObs.get()
                .subscribe((onFullFilled: ICurrentPartId) => callback(onFullFilled));
        } else {
            throw new Error('GameService.startObserving should not be called while already observing a game');
        }
    }
    public resign(partId: string, lastIndex: number, user: Player, winner: string, loser: string): Promise<void> {
        const update: Partial<IPart> = {
            winner,
            loser,
            result: MGPResult.RESIGN.value,
            request: null,
        };
        return this.partDAO.updateAndBumpIndex(partId, user, lastIndex, update); // resign
    }
    public notifyTimeout(partId: string,
                         user: Player,
                         lastIndex: number,
                         winner: string,
                         loser: string)
    : Promise<void>
    {
        const update: Partial<IPart> = {
            winner,
            loser,
            result: MGPResult.TIMEOUT.value,
            request: null,
        };
        return this.partDAO.updateAndBumpIndex(partId, user, lastIndex, update);
    }
    public sendRequest(partId: string, user: Player, lastIndex: number, request: Request): Promise<void> {
        return this.partDAO.updateAndBumpIndex(partId, user, lastIndex, { request });
    }
    public proposeDraw(partId: string, lastIndex: number, player: Player): Promise<void> {
        return this.sendRequest(partId, player, lastIndex, Request.drawProposed(player));
    }
    public acceptDraw(partId: string, lastIndex: number, as: Player): Promise<void> {
        const mgpResult: MGPResult = as === Player.ZERO ? MGPResult.AGREED_DRAW_BY_ZERO : MGPResult.AGREED_DRAW_BY_ONE;
        const update: Partial<IPart> = {
            result: mgpResult.value,
            request: null,
        };
        return this.partDAO.updateAndBumpIndex(partId, as, lastIndex, update);
    }
    public refuseDraw(partId: string, lastIndex: number, player: Player): Promise<void> {
        return this.sendRequest(partId, player, lastIndex, Request.drawRefused(player));
    }
    public proposeRematch(partId: string, lastIndex: number, player: Player): Promise<void> {
        return this.sendRequest(partId, player, lastIndex, Request.rematchProposed(player));
    }
    public async acceptRematch(part: ICurrentPartId, lastIndex: number, user: Player): Promise<void> {
        display(GameService.VERBOSE, { called: 'GameService.acceptRematch(', part });

        const iJoiner: IJoiner = await this.joinerService.readJoinerById(part.id);
        let firstPlayer: FirstPlayer;
        if (part.doc.playerZero === iJoiner.creator) {
            firstPlayer = FirstPlayer.CHOSEN_PLAYER; // so he won't start this one
        } else {
            firstPlayer = FirstPlayer.CREATOR;
        }
        const newJoiner: IJoiner = {
            ...iJoiner, // 5 attributes unchanged
            candidates: [], // they'll join again when the component reload
            firstPlayer: firstPlayer.value, // first player changed so the other one starts
            partStatus: PartStatus.PART_STARTED.value, // game ready to start
        };
        const rematchId: string = await this.joinerService.createJoiner(newJoiner);
        const startingConfig: StartingPartConfig = this.getStartingConfig(newJoiner);
        const newPart: IPart = {
            lastUpdate: {
                index: 0,
                player: user.value,
            },
            typeGame: part.doc.typeGame,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
            ...startingConfig,
        };
        await this.partDAO.set(rematchId, newPart);
        await this.createChat(rematchId);
        return this.sendRequest(part.id, user, lastIndex, Request.rematchAccepted(part.doc.typeGame, rematchId));
    }
    public askTakeBack(partId: string, lastIndex: number, player: Player): Promise<void> {
        return this.sendRequest(partId, player, lastIndex, Request.takeBackAsked(player));
    }
    public async acceptTakeBack(id: string, part: Part, observerRole: Player, msToSubstract: [number, number])
    : Promise<void>
    {
        assert(observerRole !== Player.NONE, 'Illegal for observer to make request');
        const requester: Player = Request.getPlayer(Utils.getNonNullable(part.doc.request));
        assert(requester !== observerRole, 'Illegal to accept your own request.');

        const request: Request = Request.takeBackAccepted(observerRole);
        let listMoves: JSONValueWithoutArray[] = part.doc.listMoves.slice(0, part.doc.listMoves.length - 1);
        if (listMoves.length % 2 === observerRole.value) {
            // Deleting a second move
            listMoves = listMoves.slice(0, listMoves.length - 1);
        }
        const update: Partial<IPart> = {
            request,
            listMoves,
            turn: listMoves.length,
            lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
            remainingMsForZero: Utils.getNonNullable(part.doc.remainingMsForZero) - msToSubstract[0],
            remainingMsForOne: Utils.getNonNullable(part.doc.remainingMsForOne) - msToSubstract[1],
        };
        const lastIndex: number = part.doc.lastUpdate.index;
        return await this.partDAO.updateAndBumpIndex(id, observerRole, lastIndex, update);
    }
    public refuseTakeBack(id: string, lastIndex: number, observerRole: Player): Promise<void> {
        assert(observerRole !== Player.NONE, 'Illegal for observer to make request');

        const request: Request = Request.takeBackRefused(observerRole);
        return this.partDAO.updateAndBumpIndex(id, observerRole, lastIndex, { request });
    }
    public async addGlobalTime(id: string,
                               lastIndex: number,
                               part: Part,
                               observerRole: Player)
    : Promise<void>
    {
        assert(observerRole !== Player.NONE, 'Illegal for observer to make request');

        let update: Partial<IPart> = {
            request: Request.addGlobalTime(observerRole.getOpponent()),
        };
        if (observerRole === Player.ZERO) {
            update = {
                ...update,
                remainingMsForOne: Utils.getNonNullable(part.doc.remainingMsForOne) + 5 * 60 * 1000,
            };
        } else {
            update = {
                ...update,
                remainingMsForZero: Utils.getNonNullable(part.doc.remainingMsForZero) + 5 * 60 * 1000,
            };
        }
        return await this.partDAO.updateAndBumpIndex(id, observerRole, lastIndex, update);
    }
    public async addTurnTime(observerRole: Player, lastIndex: number, id: string): Promise<void> {
        const update: Partial<IPart> = { request: Request.addTurnTime(observerRole.getOpponent()) };
        return await this.partDAO.updateAndBumpIndex(id, observerRole, lastIndex, update);
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
                               user: Player,
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

        const part: IPart = (await this.partDAO.read(partId)).get(); // TODO: optimise this
        const lastIndex: number = part.lastUpdate.index;
        const turn: number = part.turn + 1;
        const listMoves: JSONValueWithoutArray[] = ArrayUtils.copyImmutableArray(part.listMoves);
        listMoves[listMoves.length] = encodedMove;
        let update: Partial<IPart> = {
            listMoves, turn, request: null,
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
                winner, loser, result: MGPResult.VICTORY.value,
            };
        } else if (notifyDraw === true) {
            update = {
                ...update,
                result: MGPResult.HARD_DRAW.value,
            };
        }
        return await this.partDAO.updateAndBumpIndex(partId, user, lastIndex, update);
    }
}
