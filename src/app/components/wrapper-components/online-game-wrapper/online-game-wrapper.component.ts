import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { GameService } from 'src/app/services/GameService';
import { UserService } from 'src/app/services/UserService';
import { Move } from '../../../jscaip/Move';
import { ICurrentPartId, Part, MGPResult, IPart } from '../../../domain/icurrentpart';
import { CountDownComponent } from '../../normal-component/count-down/count-down.component';
import { PartCreationComponent } from '../part-creation/part-creation.component';
import { IJoueurId, IJoueur } from '../../../domain/iuser';
import { Request } from '../../../domain/request';
import { GameWrapper } from '../GameWrapper';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';
import { IJoiner } from 'src/app/domain/ijoiner';
import { ChatComponent } from '../../normal-component/chat/chat.component';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert, display, JSONValue, JSONValueWithoutArray } from 'src/app/utils/utils';
import { getDiff, getDiffChangesNumber, ObjectDifference } from 'src/app/utils/ObjectUtils';
import { GameStatus } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Time } from 'src/app/domain/Time';

export class UpdateType {

    public static readonly PRE_START_DOC: UpdateType = new UpdateType('PRE_START_DOC');

    public static readonly STARTING_DOC: UpdateType = new UpdateType('STARTING_DOC');

    public static readonly DOUBLON: UpdateType = new UpdateType('DOUBLON');

    public static readonly MOVE_WITHOUT_TIME: UpdateType = new UpdateType('MOVE_WITHOUT_TIME');

    public static readonly TIME_ALONE: UpdateType = new UpdateType('TIME_ALONE');

    public static readonly MOVE: UpdateType = new UpdateType('MOVE');

    public static readonly REQUEST: UpdateType = new UpdateType('REQUEST');

    public static readonly END_GAME: UpdateType = new UpdateType('END_GAME');

    private constructor(public readonly value: string) {}
}
@Component({
    selector: 'app-online-game-wrapper',
    templateUrl: './online-game-wrapper.component.html',
})
export class OnlineGameWrapperComponent extends GameWrapper implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    @ViewChild('partCreation')
    public partCreation: PartCreationComponent;

    @ViewChild('chatComponent')
    public chatComponent: ChatComponent;

    // GameWrapping's Template
    @ViewChild('chronoZeroGlobal') public chronoZeroGlobal: CountDownComponent;
    @ViewChild('chronoOneGlobal') public chronoOneGlobal: CountDownComponent;
    @ViewChild('chronoZeroLocal') public chronoZeroLocal: CountDownComponent;
    @ViewChild('chronoOneLocal') public chronoOneLocal: CountDownComponent;

    // link between GameWrapping's template and remote opponent
    public currentPart: Part;
    public currentPartId: string;
    public gameStarted: boolean = false;
    public opponent: IJoueurId = null;
    public currentPlayer: string;

    public rematchProposed: boolean = false;
    public opponentProposedRematch: boolean = false;

    public joiner: IJoiner;

    private hasUserPlayed: [boolean, boolean] = [false, false];

    protected routerEventsSub: Subscription;
    protected userSub: Subscription;
    protected observedPartSubscription: Subscription;
    protected opponentSubscription: () => void;

    public readonly OFFLINE_FONT_COLOR: { [key: string]: string} = { color: 'lightgrey' };

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                router: Router,
                userService: UserService,
                authenticationService: AuthenticationService,
                public gameService: GameService) {
        super(componentFactoryResolver, actRoute, router, userService, authenticationService);
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent constructed');
    }
    private extractPartIdFromURL(): string {
        return this.actRoute.snapshot.paramMap.get('id');
    }
    private extractGameTypeFromURL(): string {
        // url is ["play", "game-name", "part-id"]
        return this.actRoute.snapshot.paramMap.get('compo');
    }
    private isPlaying(): boolean {
        return this.observerRole === Player.ZERO.value ||
               this.observerRole === Player.ONE.value;
    }
    private getPlayer(): Player {
        return Player.of(this.observerRole);
    }
    private isPlayer(player: Player): boolean {
        return this.observerRole === player.value;
    }
    private isOpponent(player: Player): boolean {
        return this.observerRole !== player.value;
    }
    private async redirectIfPartIsInvalid(): Promise<void> {
        const gameType: string = this.extractGameTypeFromURL();
        const partValidity: MGPValidation =
            await this.gameService.getPartValidity(this.currentPartId, gameType);
        if (partValidity.isFailure()) {
            // note, option if WRONG_GAME_TYPE to redirect to another page
            const page: string = '/notFound';
            this.routerEventsSub.unsubscribe();
            this.router.navigate([page]);
        }
    }
    private async setCurrentPartIdOrRedirect(): Promise<void> {
        this.currentPartId = this.extractPartIdFromURL();
        await this.redirectIfPartIsInvalid();
    }
    public async ngOnInit(): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnInit');

        this.routerEventsSub = this.router.events.subscribe(async(ev: Event) => {
            if (ev instanceof NavigationEnd) {
                await this.setCurrentPartIdOrRedirect();
            }
        });
        await this.setCurrentPartIdOrRedirect();
        this.userSub = this.authenticationService.getJoueurObs()
            .subscribe((user: { pseudo: string, verified: boolean}) => this.userName = user.pseudo);
    }
    public startGame(iJoiner: IJoiner): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startGame');

        assert(iJoiner != null, 'Cannot start Game of empty joiner doc');
        assert(this.gameStarted === false, 'Should not start already started game');
        this.joiner = iJoiner;

        this.gameStarted = true;
        setTimeout(() => {
            // the small waiting is there to make sur that the chronos are charged by view
            this.afterGameIncluderViewInit();
            this.startPart();
        }, 1);
    }
    protected async startPart(): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startPart');

        // TODO: don't start count down for Observer.
        this.gameService.startObserving(this.currentPartId, (iPart: ICurrentPartId) => {
            this.onCurrentPartUpdate(iPart);
        });
        return Promise.resolve();
    }
    protected async onCurrentPartUpdate(update: ICurrentPartId): Promise<void> {
        const part: Part = new Part(update.doc);
        display(OnlineGameWrapperComponent.VERBOSE, { OnlineGameWrapperComponent_onCurrentPartUpdate: {
            before: this.currentPart,
            then: update.doc,
            before_part_turn: part.doc.turn,
            before_slice_turn: this.gameComponent.rules.node.gamePartSlice.turn,
            nbPlayedMoves: part.doc.listMoves.length,
        } });
        const updateType: UpdateType = this.getUpdateType(part);
        console.log(updateType.value)
        const oldPart: Part = this.currentPart;
        this.currentPart = part;
        display(OnlineGameWrapperComponent.VERBOSE,
                'OnlineGameWrapperComponent.onCurrentPartUpdate: UpdateType.' + updateType.value);
        switch (updateType) {
            case UpdateType.REQUEST:
                return await this.onRequest(part.doc.request);
            case UpdateType.DOUBLON:
                return;
            case UpdateType.END_GAME:
                return this.checkEndGames();
                // TODO: might no longer be checkEndGame but "do"EndGame
            case UpdateType.MOVE_WITHOUT_TIME:
                console.log('MOVE_WITHOUT_TIME received at ', Date.now());
                return this.doNewMoves(part);
            case UpdateType.TIME_ALONE:
                const lastMoveTime: number = this.getLastMoveTime(oldPart, part);
                // this.currentPart = oldPart;
                return;
            case UpdateType.MOVE:
                console.log('MOVE at ', Date.now());
                return this.doNewMoves(part);
            case UpdateType.PRE_START_DOC:
                if (oldPart != null && oldPart.doc.beginning != null &&
                    this.currentPart != null && this.currentPart.doc.beginning == null) {
                    console.log('ils nous chient dans la colle patron!!!');
                }
                return;
            default:
                assert(updateType === UpdateType.STARTING_DOC, 'Unexpected update type ' + updateType);
                this.setChronos();
                this.setPlayersDatas(part);
                return this.startCountDownFor(Player.ZERO);
        }
    }
    public getUpdateType(update: Part): UpdateType {
        console.log({ update })
        const currentPartDoc: IPart = this.currentPart ? this.currentPart.doc : null;
        const diff: ObjectDifference = getDiff(currentPartDoc, update.doc);
        display(OnlineGameWrapperComponent.VERBOSE, { diff });
        const nbDiffs: number = getDiffChangesNumber(diff);
        if (diff == null || nbDiffs === 0) {
            return UpdateType.DOUBLON;
        }
        if (this.isTimeAlone(diff, nbDiffs)) {
            return UpdateType.TIME_ALONE;
        }
        if (update.doc.request) {
            return UpdateType.REQUEST;
        }
        if (this.isMove(diff, nbDiffs)) {
            if (diff.modified['lastMoveTime'] == null) {
                return UpdateType.MOVE_WITHOUT_TIME;
            } else {
                return UpdateType.MOVE;
            }
        }
        if (update.doc.beginning == null) {
            return UpdateType.PRE_START_DOC;
        }
        if (update.doc.result !== MGPResult.UNACHIEVED.value) {
            return UpdateType.END_GAME;
        }
        if (update.doc.beginning != null && update.doc.listMoves.length === 0) {
            return UpdateType.STARTING_DOC;
        }
        throw new Error('Unexpected update: ' + JSON.stringify(diff));
    }
    public isTimeAlone(diff: ObjectDifference, nbDiffs: number): boolean {
        return nbDiffs === 1 && diff.added['lastMoveTime'] !== undefined;
    }
    public isMove(diff: ObjectDifference, nbDiffs: number): boolean {
        if (diff.modified['listMoves'] && diff.modified['turn']) {
            const lastMoveTimeModified: number = this.isLastMoveUpdated(diff) ? 1 : 0;
            const scoreZeroUpdated: number = this.isUpdated(diff, 'scorePlayerZero') ? 1 : 0;
            const scoreOneUpdated: number = this.isUpdated(diff, 'scorePlayerOne') ? 1 : 0;
            const requestRemoved: number = diff.removed['request'] == null ? 0 : 1;
            const nbValidMoveDiffs: number = lastMoveTimeModified +
                                             scoreZeroUpdated +
                                             scoreOneUpdated +
                                             requestRemoved +
                                             2;
            return nbDiffs === nbValidMoveDiffs;
        } else {
            return false;
        }
    }
    public isLastMoveUpdated(diff: ObjectDifference): boolean {
        if (diff.added['lastMoveTime']) {
            console.log('lastMoveTime added', this.currentPart.doc.lastMoveTime)
            return true;
        }
        if (diff.modified['lastMoveTime']) {
            console.log('lastMoveTime modified', this.currentPart.doc.lastMoveTime)
            return true;
        }
        if (diff.removed['lastMoveTime']) {
            console.log('lastMoveTime removed', this.currentPart.doc.lastMoveTime)
            return true;
        }
        return false;
    }
    public isUpdated(diff: ObjectDifference, key: string): boolean {
        return diff.added[key] != null ||
               diff.modified[key] != null ||
               diff.removed[key] != null;
    }
    public getLastMoveTime(oldPart: Part, update: Part): number {
        if (oldPart == null) {
            if (update == null) {
                console.log('getLastMoveTime nullinull');
            } else {
                const updateTime: number = (update.doc.lastMoveTime as Time).seconds;
                console.log('getLastMoveTime lastTime adding:', updateTime);
            }
        } else {
            const oldTime: number = (oldPart.doc.lastMoveTime as Time).seconds;
            if (update == null) {
                console.log('getLastMoveTime lastTime removal:', oldTime);
            } else {
                const updateMs: number = this.getMs(update.doc.lastMoveTime as Time);
                const beginningMs: number = this.getMs(update.doc.beginning as Time);
                const totalPartDuration: number = this.joiner.totalPartDuration;
                let passiveRemainingTime: number;
                let activeChrono: CountDownComponent;
                if (oldPart.doc.turn % 2 === 0) {
                    passiveRemainingTime = this.chronoOneGlobal.remainingTime / 1000;
                    activeChrono = this.chronoZeroGlobal;
                } else {
                    passiveRemainingTime = this.chronoZeroGlobal.remainingTime / 1000;
                    activeChrono = this.chronoOneGlobal;
                }
                const concreteTimeUsedByActive: number = activeChrono.remainingTime / 1000;
                // updateTime - beginningTime = timeUsedByPassive + timeUsedByActive
                // updateTime - beginningTime = (totalPartDuration - passiveGlobalChrono.remaining) + timeUsedByActive
                const timeUsedByActive: number = updateMs - beginningMs - totalPartDuration + passiveRemainingTime;
                const msToAdd: number = timeUsedByActive - concreteTimeUsedByActive;
                console.log('getLastMoveTime lastTime update from', oldTime, 'to', updateMs, 'and used time:', timeUsedByActive, 'different then by', msToAdd);
                if (msToAdd < 0) {
                    console.log('enfant de cul c négatif!!')
                } else {
                    activeChrono.addTime(msToAdd);
                }
            }
        }
        return;
    }
    private getMs(time: Time): number {
        return time.seconds * 1000;
    }
    public setChronos(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'onlineGameWrapperComponent.setChronos()');
        this.chronoZeroGlobal.setDuration(this.joiner.totalPartDuration * 1000);
        this.chronoOneGlobal.setDuration(this.joiner.totalPartDuration * 1000);

        this.chronoZeroLocal.setDuration(this.joiner.maximalMoveDuration * 1000);
        this.chronoOneLocal.setDuration(this.joiner.maximalMoveDuration * 1000);
    }
    private didUserPlay(player: Player): boolean {
        return this.hasUserPlayed[player.value];
    }
    private doNewMoves(part: Part) {
        this.switchPlayer();
        let currentPartTurn: number;
        const listMoves: JSONValue[] = ArrayUtils.copyImmutableArray(part.doc.listMoves);
        while (this.gameComponent.rules.node.gamePartSlice.turn < listMoves.length) {
            currentPartTurn = this.gameComponent.rules.node.gamePartSlice.turn;
            const chosenMove: Move = this.gameComponent.encoder.decode(listMoves[currentPartTurn]);
            const correctDBMove: boolean = this.gameComponent.rules.choose(chosenMove);
            const message: string = 'We received an incorrect db move: ' + chosenMove.toString() +
                                    ' in ' + listMoves + ' at turn ' + currentPartTurn;
            assert(correctDBMove === true, message);
        }
        this.currentPlayer = this.players[this.gameComponent.rules.node.gamePartSlice.turn % 2];
        this.gameComponent.updateBoard();
    }
    private switchPlayer(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.switchPlayer');
        const part: Part = this.currentPart;
        const currentEnnemy: Player = part.doc.turn % 2 === 0 ? Player.ONE : Player.ZERO;
        if (this.didUserPlay(currentEnnemy)) {
            this.pauseCountDownsFor(currentEnnemy);
        }
        const currentPlayer: Player = Player.fromTurn(part.doc.turn);
        if (this.didUserPlay(currentPlayer)) {
            display(OnlineGameWrapperComponent.VERBOSE,
                    'OnlineGameWrapperComponent.onCurrentPartUpdate: changing current player');
            this.resumeCountDownFor(currentPlayer);
        } else {
            this.startCountDownFor(currentPlayer);
        }
    }
    private checkEndGames() {
        // fonctionne pour l'instant avec la victoire normale, l'abandon, et le timeout !
        const currentPart: Part = this.currentPart;
        const player: Player = Player.fromTurn(currentPart.doc.turn);
        this.endGame = true;
        if (MGPResult.VICTORY.value === currentPart.doc.result) {
            this.doNewMoves(this.currentPart);
            this.stopCountdownsFor(player);
        } else {
            const endGameResults: MGPResult[] = [MGPResult.DRAW, MGPResult.RESIGN, MGPResult.TIMEOUT];
            const resultIsIncluded: boolean =
                endGameResults.some((result: MGPResult) => result.value === currentPart.doc.result);
            assert(resultIsIncluded === true, 'Unknown type of end game (' + currentPart.doc.result + ')');
            display(OnlineGameWrapperComponent.VERBOSE, 'endGame est true et winner est ' + currentPart.getWinner());
            this.stopCountdownsFor(player);
        }
    }
    public notifyDraw(encodedMove: JSONValueWithoutArray, scorePlayerZero: number, scorePlayerOne: number): void {
        this.endGame = true;
        this.gameService.updateDBBoard(this.currentPartId, encodedMove, scorePlayerZero, scorePlayerOne, true);
    }
    public notifyTimeoutVictory(victoriousPlayer: string, loser: string): void {
        this.endGame = true;

        // TODO: should the part be updated here? Or instead should we wait for the update from firestore?
        const wonPart: Part = this.currentPart.setWinnerAndLoser(victoriousPlayer, loser);
        this.currentPart = wonPart;

        this.gameService.notifyTimeout(this.currentPartId, victoriousPlayer, loser);
    }
    public notifyVictory(encodedMove: JSONValueWithoutArray, scorePlayerZero: number, scorePlayerOne: number): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.notifyVictory');

        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node);
        if (gameStatus === GameStatus.ONE_WON) {
            this.currentPart = this.currentPart.setWinnerAndLoser(this.players[1], this.players[0]);
        } else {
            assert(gameStatus === GameStatus.ZERO_WON, 'impossible to get a victory without winner!');
            this.currentPart = this.currentPart.setWinnerAndLoser(this.players[0], this.players[1]);
        }
        this.endGame = true;

        this.gameService.updateDBBoard(this.currentPartId,
                                       encodedMove,
                                       scorePlayerZero,
                                       scorePlayerOne,
                                       false,
                                       this.currentPart.getWinner(),
                                       this.currentPart.getLoser());
    }
    public canAskTakeBack(): boolean {
        if (this.isPlaying() === false) {
            return false;
        } else if (this.currentPart == null) {
            return false;
        } else if (this.currentPart.doc.turn <= this.observerRole) {
            return false;
        } else if (this.currentPart.doc.request &&
                   this.currentPart.doc.request.code === 'TakeBackRefused' &&
                   this.currentPart.doc.request.data['player'] === this.getPlayer().getOpponent().value)
        {
            return false;
        } else if (this.getTakeBackRequester() === Player.NONE) {
            return true;
        } else {
            return false;
        }
    }
    public isOpponentWaitingForTakeBackResponse(): boolean {
        const takeBackRequester: Player = this.getTakeBackRequester();
        if (takeBackRequester === Player.NONE) return false;
        return this.isOpponent(takeBackRequester);
    }
    private getTakeBackRequester(): Player {
        if (this.currentPart == null) {
            return Player.NONE;
        }
        const request: Request = this.currentPart.doc.request;
        if (request && request.code === 'TakeBackAsked') {
            return Player.of(request.data['player']);
        } else {
            return Player.NONE;
        }
    }
    public canProposeDraw(): boolean {
        if (this.isPlaying() === false) {
            return false;
        } else if (this.endGame) {
            return false;
        } else if (this.currentPart == null) {
            return false;
        } else if (this.currentPart.doc.request &&
                   this.currentPart.doc.request.code === 'DrawRefused' &&
                   this.currentPart.doc.request.data['player'] === this.getPlayer().getOpponent().value)
        {
            return false;
        } else if (this.isOpponentWaitingForDrawResponse()) {
            return false;
        } else if (this.getDrawRequester() === Player.NONE) {
            return true;
        } else {
            return false;
        }
    }
    public isOpponentWaitingForDrawResponse(): boolean {
        const drawRequester: Player = this.getDrawRequester();
        if (drawRequester === Player.NONE) return false;
        return this.isOpponent(drawRequester);
    }
    private getDrawRequester(): Player {
        if (this.currentPart == null) {
            return Player.NONE;
        }
        const request: Request = this.currentPart.doc.request;
        if (request == null) {
            return Player.NONE;
        } else if (request.code === 'DrawProposed') {
            return Player.of(request.data['player']);
        } else {
            return Player.NONE;
        }
    }
    protected async onRequest(request: Request): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'dans OnlineGameWrapper.onRequest(' + request.code + ')');
        switch (request.code) {
            case 'TakeBackAsked':
                break;
            case 'TakeBackRefused':
                break;
            case 'TakeBackAccepted':
                this.takeBackFor(Player.of(request.data['player']).getOpponent());
                break;
            case 'RematchProposed':
                this.rematchProposed = true;
                if (this.isPlayer(Player.of(request.data['player']).getOpponent())) {
                    display(OnlineGameWrapperComponent.VERBOSE, 'ton adversaire te propose une revanche');
                    this.opponentProposedRematch = true;
                }
                break;
            case 'RematchAccepted':
                await this.router.navigate(['/nextGameLoading']);
                await this.router.navigate(['/play/' + request.data['typeGame'] + '/' + request.data['partId']]);
                break;
            case 'DrawProposed':
                break;
            case 'DrawRefused':
                break;
            default:
                assert(request.code === 'DrawAccepted', 'there was an error : ' + JSON.stringify(request) + ' had ' + request.code + ' value');
                this.acceptDraw();
                break;
        }
    }
    private takeBackFor(player: Player) {
        this.gameComponent.rules.node = this.gameComponent.rules.node.mother;
        if (this.gameComponent.rules.node.gamePartSlice.turn % 2 === player.value) {
            this.switchPlayer();
        } else {
            // Second time to make sure it end up on player's turn
            this.gameComponent.rules.node = this.gameComponent.rules.node.mother;
        }
        this.gameComponent.updateBoard();
    }
    public setPlayersDatas(updatedICurrentPart: Part): void {
        display(OnlineGameWrapperComponent.VERBOSE, { OnlineGameWrapper_setPlayersDatas: updatedICurrentPart });
        this.players = [
            updatedICurrentPart.doc.playerZero,
            updatedICurrentPart.doc.playerOne];
        assert(updatedICurrentPart.doc.playerOne != null, 'should not setPlayersDatas when players data is not received');
        this.currentPlayer = this.players[updatedICurrentPart.doc.turn % 2];
        console.log({ setPlayersDatas: updatedICurrentPart });
        let opponentName: string = '';
        if (this.players[0] === this.userName) {
            this.observerRole = Player.ZERO.value;
            opponentName = this.players[1];
        } else if (this.players[1] === this.userName) {
            this.observerRole = Player.ONE.value;
            opponentName = this.players[0];
        } else {
            this.observerRole = Player.NONE.value;
        }
        if (opponentName !== '') {
            const onDocumentCreated: (foundUser: IJoueurId[]) => void = (foundUser: IJoueurId[]) => {
                this.opponent = foundUser[0];
            };
            const onDocumentModified: (modifiedUsers: IJoueurId[]) => void = (modifiedUsers: IJoueurId[]) => {
                this.opponent = modifiedUsers[0];
            };
            const onDocumentDeleted: (deletedUsers: IJoueurId[]) => void = (deletedUsers: IJoueurId[]) => {
                throw new Error('OnlineGameWrapper: Opponent was deleted, what sorcery is this: ' +
                                JSON.stringify(deletedUsers));
            };
            const callback: FirebaseCollectionObserver<IJoueur> =
                new FirebaseCollectionObserver(onDocumentCreated,
                                               onDocumentModified,
                                               onDocumentDeleted);
            this.opponentSubscription =
                this.userService.observeUserByPseudo(opponentName, callback);
        }
    }
    public async onLegalUserMove(move: Move, scorePlayerZero: number, scorePlayerOne: number): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'dans OnlineGameWrapperComponent.onLegalUserMove');
        if (this.isOpponentWaitingForTakeBackResponse()) {
            this.gameComponent.message('You must answer to take back request');
        } else {
            return this.updateDBBoard(move, scorePlayerZero, scorePlayerOne);
        }
    }
    public async updateDBBoard(move: Move, scorePlayerZero: number, scorePlayerOne: number): Promise<void> {
        const encodedMove: JSONValueWithoutArray = this.gameComponent.encoder.encodeMove(move);
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.updateDBBoard(' + move.toString() +
                                                    ', ' + scorePlayerZero + ', ' + scorePlayerOne + ')');
        this.gameComponent.rules.choose(move);
        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node);
        if (gameStatus.isEndGame) {
            if (gameStatus === GameStatus.DRAW) {
                this.notifyDraw(encodedMove, scorePlayerZero, scorePlayerOne);
            } else {
                this.notifyVictory(encodedMove, scorePlayerZero, scorePlayerOne);
            }
        } else {
            return this.gameService.updateDBBoard(this.currentPartId, encodedMove, scorePlayerZero, scorePlayerOne);
        }
    }
    public resign(): void {
        const victoriousOpponent: string = this.players[(this.observerRole + 1) % 2];
        this.gameService.resign(this.currentPartId, victoriousOpponent, this.currentPlayer);
    }
    public reachedOutOfTime(player: 0 | 1): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.reachedOutOfTime(' + player + ')');
        this.stopCountdownsFor(Player.of(player));
        if (player === this.observerRole) {
            // the player has run out of time, he'll notify his own defeat by time
            this.notifyTimeoutVictory(this.opponent.doc.pseudo, this.userName);
        } else {
            if (this.endGame) {
                display(true, 'time might be better handled in the future');
            } else {
                // the other player has timed out
                if (this.opponentIsOffline()) {
                    this.notifyTimeoutVictory(this.userName, this.opponent.doc.pseudo);
                    this.endGame = true;
                }
            }
        }
    }
    public acceptRematch(): boolean {
        if (this.isPlaying() === false) {
            return false;
        }
        const currentPartId: ICurrentPartId = {
            id: this.currentPartId,
            doc: this.currentPart.doc,
        };
        this.gameService.acceptRematch(currentPartId);
        return true;
    }
    public proposeRematch(): boolean {
        if (this.isPlaying() === false) {
            return false;
        }
        this.gameService.proposeRematch(this.currentPartId, this.getPlayer());
        return true;
    }
    public proposeDraw(): void {
        this.gameService.proposeDraw(this.currentPartId, this.getPlayer());
    }
    public acceptDraw(): void {
        this.gameService.acceptDraw(this.currentPartId);
    }
    public refuseDraw(): void {
        const player: Player = Player.of(this.observerRole);
        this.gameService.refuseDraw(this.currentPartId, player);
    }
    public askTakeBack(): void {
        const player: Player = Player.of(this.observerRole);
        this.gameService.askTakeBack(this.currentPartId, player);
    }
    public acceptTakeBack(): void {
        const player: Player = Player.of(this.observerRole);
        this.gameService.acceptTakeBack(this.currentPartId, this.currentPart, player);
    }
    public refuseTakeBack(): void {
        const player: Player = Player.of(this.observerRole);
        this.gameService.refuseTakeBack(this.currentPartId, player);
    }
    public startCountDownFor(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE,
                'dans OnlineGameWrapperComponent.startCountDownFor(' + player.toString() +
                ') (turn ' + this.currentPart.doc.turn + ')');
        this.hasUserPlayed[player.value] = true;
        if (player === Player.ZERO) {
            this.chronoZeroGlobal.start();
            this.chronoZeroLocal.start();
        } else {
            this.chronoOneGlobal.start();
            this.chronoOneLocal.start();
        }
    }
    private resumeCountDownFor(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE,
                'dans OnlineGameWrapperComponent.resumeCountDownFor(' + player.toString() +
                ') (turn ' + this.currentPart.doc.turn + ')');

        if (player === Player.ZERO) {
            this.chronoZeroGlobal.resume();
            this.chronoZeroLocal.setDuration(this.joiner.maximalMoveDuration * 1000);
            this.chronoZeroLocal.start();
        } else {
            this.chronoOneGlobal.resume();
            this.chronoOneLocal.setDuration(this.joiner.maximalMoveDuration * 1000);
            this.chronoOneLocal.start();
        }
    }
    public pauseCountDownsFor(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE,
                'dans OnlineGameWrapperComponent.pauseCountDownFor(' + player.value +
                ') (turn ' + this.currentPart.doc.turn + ')');
        if (player === Player.ZERO) {
            this.chronoZeroGlobal.pause();
            this.chronoZeroLocal.stop();
        } else {
            this.chronoOneGlobal.pause();
            this.chronoOneLocal.stop();
        }
    }
    private stopCountdownsFor(player: Player) {
        display(OnlineGameWrapperComponent.VERBOSE,
                'cdc::stopCountDownsFor(' + player.toString() +
                ') (turn ' + this.currentPart.doc.turn + ')');

        if (player === Player.ZERO) {
            if (this.chronoZeroGlobal.isStarted()) {
                this.chronoZeroGlobal.stop();
            }
            if (this.chronoZeroLocal.isStarted()) {
                this.chronoZeroLocal.stop();
            }
        } else {
            if (this.chronoOneGlobal.isStarted()) {
                this.chronoOneGlobal.stop();
            }
            if (this.chronoOneLocal.isStarted()) {
                this.chronoOneLocal.stop();
            }
        }
    }
    public getPlayerNameFontColor(player: number): { [key: string]: string} {
        if (this.observerRole === player || this.observerRole > 1) {
            return { color: 'black' };
        } else if (this.opponentIsOffline()) {
            return this.OFFLINE_FONT_COLOR;
        } else {
            return { color: 'black' };
        }
    }
    public opponentIsOffline(): boolean {
        return this.opponent && this.opponent.doc && this.opponent.doc.state === 'offline';
    }
    public canResign(): boolean {
        if (this.isPlaying() === false) {
            return false;
        }
        if (this.endGame === true) {
            return false;
        }
        if (this.opponent == null) {
            return false;
        }
        return true;
    }
    public ngOnDestroy(): void {
        if (this.routerEventsSub && this.routerEventsSub.unsubscribe) {
            this.routerEventsSub.unsubscribe();
        }
        if (this.userSub && this.userSub.unsubscribe) {
            this.userSub.unsubscribe();
        }
        if (this.gameStarted === true) {
            if (this.observedPartSubscription) {
                this.observedPartSubscription.unsubscribe();
            }
            if (this.opponentSubscription) {
                this.opponentSubscription();
            }
            this.gameService.stopObserving();
        }
    }
}
