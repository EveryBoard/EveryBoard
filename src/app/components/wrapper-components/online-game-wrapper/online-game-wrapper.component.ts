import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { GameService } from 'src/app/services/GameService';
import { UserService } from 'src/app/services/UserService';
import { Move } from '../../../jscaip/Move';
import { ICurrentPartId, Part, MGPResult, IPart } from '../../../domain/icurrentpart';
import { CountDownComponent } from '../../normal-component/count-down/count-down.component';
import { PartCreationComponent } from '../part-creation/part-creation.component';
import { IUserId, IUser } from '../../../domain/iuser';
import { Request } from '../../../domain/request';
import { GameWrapper } from '../GameWrapper';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';
import { IJoiner } from 'src/app/domain/ijoiner';
import { ChatComponent } from '../../normal-component/chat/chat.component';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert, display, JSONValue, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { ObjectDifference } from 'src/app/utils/ObjectUtils';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Time } from 'src/app/domain/Time';
import { getMillisecondsDifference } from 'src/app/utils/TimeUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameState } from 'src/app/jscaip/GameState';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class UpdateType {

    public static readonly PRE_START_DOC: UpdateType = new UpdateType('PRE_START_DOC');

    public static readonly STARTING_DOC: UpdateType = new UpdateType('STARTING_DOC');

    public static readonly DUPLICATE: UpdateType = new UpdateType('DUPLICATE');

    public static readonly MOVE_WITHOUT_TIME: UpdateType = new UpdateType('MOVE_WITHOUT_TIME');

    public static readonly MOVE: UpdateType = new UpdateType('MOVE');

    public static readonly REQUEST: UpdateType = new UpdateType('REQUEST');

    public static readonly END_GAME: UpdateType = new UpdateType('END_GAME');

    public static readonly END_GAME_WITHOUT_TIME: UpdateType = new UpdateType('END_GAME_WITHOUT_TIME');

    public static readonly ACCEPT_TAKE_BACK_WITHOUT_TIME: UpdateType = new UpdateType('ACCEPT_TAKE_BACK_WITHOUT_TIME');

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
    @ViewChild('chronoZeroTurn') public chronoZeroTurn: CountDownComponent;
    @ViewChild('chronoOneTurn') public chronoOneTurn: CountDownComponent;

    // link between GameWrapping's template and remote opponent
    public currentPart: Part;
    public currentPartId: string;
    public gameStarted: boolean = false;
    public opponent: IUserId | null = null;
    public playerName: string | null = null;
    public currentPlayer: string;

    public rematchProposed: boolean = false;
    public opponentProposedRematch: boolean = false;

    public joiner: IJoiner;

    private hasUserPlayed: [boolean, boolean] = [false, false];
    private msToSubstract: [number, number] = [0, 0];
    private previousUpdateWasATakeBack: boolean = false;

    protected routerEventsSub!: Subscription; // Initialized in ngOnInit
    protected userSub!: Subscription; // Initialized in ngOnInit
    protected opponentSubscription: MGPOptional<() => void> = MGPOptional.empty();

    public readonly OFFLINE_FONT_COLOR: { [key: string]: string} = { color: 'lightgrey' };

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                private router: Router,
                private userService: UserService,
                authenticationService: AuthenticationService,
                private gameService: GameService)
    {
        super(componentFactoryResolver, actRoute, authenticationService);
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent constructed');
    }
    private extractPartIdFromURL(): string {
        return Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('id'));
    }
    private extractGameTypeFromURL(): string {
        // url is ["play", "game-name", "part-id"]
        return Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('compo'));
    }
    public isPlaying(): boolean {
        return this.observerRole === Player.ZERO.value ||
               this.observerRole === Player.ONE.value;
    }
    private getPlayer(): Player {
        return Player.of(this.observerRole);
    }
    public getPlayerName(): string {
        return Utils.getNonNullable(this.playerName);
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
        this.userSub = this.authenticationService.getUserObs()
            .subscribe((user: AuthUser) => {
                // player should be authenticated and have a username to be here
                this.playerName = user.username.get();
            });
        await this.setCurrentPartIdOrRedirect();
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
    private async onCurrentPartUpdate(update: ICurrentPartId): Promise<void> {
        const part: Part = new Part(update.doc);
        display(OnlineGameWrapperComponent.VERBOSE || true, { OnlineGameWrapperComponent_onCurrentPartUpdate: {
            before: this.currentPart, then: update.doc, before_part_turn: part.doc.turn,
            before_state_turn: this.gameComponent.rules.node.gameState.turn, nbPlayedMoves: part.doc.listMoves.length,
        } });
        const updateType: UpdateType = this.getUpdateType(part);
        const turn: number = update.doc.turn;
        if (updateType === UpdateType.REQUEST) {
            display(OnlineGameWrapperComponent.VERBOSE, 'UpdateType: Request(' + Utils.getNonNullable(part.doc.request).code + ') (' + turn + ')');
        } else {
            display(OnlineGameWrapperComponent.VERBOSE, 'UpdateType: ' + updateType.value + '(' + turn + ')');
        }
        const oldPart: Part = this.currentPart;
        this.currentPart = part;

        switch (updateType) {
            case UpdateType.REQUEST:
                return await this.onRequest(Utils.getNonNullable(part.doc.request), oldPart);
            case UpdateType.ACCEPT_TAKE_BACK_WITHOUT_TIME:
                this.currentPart = oldPart;
                return;
            case UpdateType.DUPLICATE:
                return;
            case UpdateType.END_GAME_WITHOUT_TIME:
                this.currentPart = oldPart;
                return;
            case UpdateType.END_GAME:
                return this.applyEndGame();
            case UpdateType.MOVE_WITHOUT_TIME:
                this.currentPart = oldPart;
                return;
            case UpdateType.MOVE:
                this.msToSubstract = this.getLastMoveTime(oldPart, part, updateType);
                return this.doNewMoves(part);
            case UpdateType.PRE_START_DOC:
                const oldPartHadNoBeginningTime: boolean = oldPart == null ||
                                                           oldPart.doc.beginning == null;
                const newPartHasBeginningTime: boolean = this.currentPart == null ||
                                                         this.currentPart.doc.beginning != null;
                // Assert from ~September 2021, could be removed if it is never encountered
                assert(oldPartHadNoBeginningTime || newPartHasBeginningTime, 'old part had no beginning time or new part has, we did not expect this!');
                return;
            default:
                assert(updateType === UpdateType.STARTING_DOC, 'Unexpected update type ' + updateType);
                this.setChronos();
                this.setPlayersDatas(part);
                return this.startCountDownFor(Player.ZERO);
        }
    }
    public getUpdateType(update: Part): UpdateType {
        const currentPartDoc: IPart | null = this.currentPart != null ? this.currentPart.doc : null;
        const diff: ObjectDifference = ObjectDifference.from(currentPartDoc, update.doc);
        display(OnlineGameWrapperComponent.VERBOSE, { diff });
        const nbDiffs: number = diff.countChanges();
        if (nbDiffs === 0) {
            return UpdateType.DUPLICATE;
        }
        if (update.doc.request) {
            if (update.doc.request.code === 'TakeBackAccepted' && diff.removed['lastMoveTime'] != null) {
                return UpdateType.ACCEPT_TAKE_BACK_WITHOUT_TIME;
            } else {
                return UpdateType.REQUEST;
            }
        }
        if (this.isMove(diff, nbDiffs)) {
            if (update.doc.turn === 1) {
                if (update.doc.lastMoveTime == null) {
                    return UpdateType.MOVE_WITHOUT_TIME;
                } else {
                    return UpdateType.MOVE;
                }
            } else {
                if (diff.modified['lastMoveTime'] == null) {
                    return UpdateType.MOVE_WITHOUT_TIME;
                } else {
                    return UpdateType.MOVE;
                }
            }
        }
        if (update.doc.beginning == null) {
            return UpdateType.PRE_START_DOC;
        }
        if (update.doc.result !== MGPResult.UNACHIEVED.value) {
            const turnModified: boolean = diff.modified['turn'] != null;
            const lastMoveTimeMissing: boolean = diff.modified['lastMoveTime'] == null;
            if (turnModified && lastMoveTimeMissing) {
                return UpdateType.END_GAME_WITHOUT_TIME;
            } else {
                return UpdateType.END_GAME;
            }
        }
        assert(update.doc.beginning != null && update.doc.listMoves.length === 0,
               'Unexpected update: ' + JSON.stringify(diff));
        return UpdateType.STARTING_DOC;
    }
    public isMove(diff: ObjectDifference, nbDiffs: number): boolean {
        if (diff.modified['listMoves'] != null && diff.modified['turn'] != null) {
            const modifOnListMovesTurnAndLastUpdateFields: number = 3;
            const lastMoveTimeModified: number = diff.isPresent('lastMoveTime').present ? 1 : 0;
            const scoreZeroUpdated: number = diff.isPresent('scorePlayerZero').present ? 1 : 0;
            const scoreOneUpdated: number = diff.isPresent('scorePlayerOne').present ? 1 : 0;
            const remainingMsForZeroUpdated: number = diff.isPresent('remainingMsForZero').present ? 1 : 0;
            const remainingMsForOneUpdated: number = diff.isPresent('remainingMsForOne').present ? 1 : 0;
            const requestRemoved: number = diff.removed['request'] == null ? 0 : 1;
            const nbValidMoveDiffs: number = lastMoveTimeModified +
                                             scoreZeroUpdated +
                                             scoreOneUpdated +
                                             remainingMsForZeroUpdated +
                                             remainingMsForOneUpdated +
                                             requestRemoved +
                                             modifOnListMovesTurnAndLastUpdateFields;
            return nbDiffs === nbValidMoveDiffs;
        } else {
            return false;
        }
    }
    public getLastMoveTime(oldPart: Part, update: Part, type: UpdateType): [number, number] {
        const oldTime: Time | null = this.getMoreRecentTime(oldPart);
        const updateTime: Time | null= this.getMoreRecentTime(update);
        assert(oldTime != null, 'TODO: OLD_TIME WAS NULL, UNDO COMMENT AND TEST!');
        assert(updateTime != null, 'TODO UPDATE_TIME WAS NULL, UNDO COMMENT AND TEST!');
        const last: Player = Player.fromTurn(oldPart.doc.turn);
        return this.getTimeUsedForLastTurn(Utils.getNonNullable(oldTime),
                                           Utils.getNonNullable(updateTime),
                                           type, last);
    }
    private getMoreRecentTime(part: Part): Time | null {
        if (part.doc.lastMoveTime == null) {
            return part.doc.beginning as Time;
        } else {
            return part.doc.lastMoveTime as Time;
        }
    }
    private getTimeUsedForLastTurn(oldTime: Time,
                                   updateTime: Time,
                                   _type: UpdateType,
                                   last: Player)
    : [number, number]
    {
        const moveDurationDBWise: number = getMillisecondsDifference(oldTime, updateTime);
        const msToSubstract: [number, number] = [0, 0];
        msToSubstract[last.value] = moveDurationDBWise;
        return msToSubstract;
    }
    public setChronos(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'onlineGameWrapperComponent.setChronos()');
        this.chronoZeroGlobal.setDuration(this.joiner.totalPartDuration * 1000);
        this.chronoOneGlobal.setDuration(this.joiner.totalPartDuration * 1000);

        this.chronoZeroTurn.setDuration(this.joiner.maximalMoveDuration * 1000);
        this.chronoOneTurn.setDuration(this.joiner.maximalMoveDuration * 1000);
    }
    private didUserPlay(player: Player): boolean {
        return this.hasUserPlayed[player.value];
    }
    private doNewMoves(part: Part) {
        this.switchPlayer();
        const listMoves: JSONValue[] = ArrayUtils.copyImmutableArray(part.doc.listMoves);
        const rules: Rules<Move, GameState, unknown> = this.gameComponent.rules;
        while (rules.node.gameState.turn < listMoves.length) {
            const currentPartTurn: number = rules.node.gameState.turn;
            const chosenMove: Move = this.gameComponent.encoder.decode(listMoves[currentPartTurn]);
            const legality: MGPFallible<unknown> = rules.isLegal(chosenMove, rules.node.gameState);
            const message: string = 'We received an incorrect db move: ' + chosenMove.toString() +
                                    ' in ' + listMoves + ' at turn ' + currentPartTurn +
                                    'because "' + legality.getReasonOr('') + '"';
            assert(legality.isSuccess(), message);
            rules.choose(chosenMove);
        }
        this.currentPlayer = this.players[this.gameComponent.rules.node.gameState.turn % 2].get();
        this.gameComponent.updateBoard();
    }
    public switchPlayer(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.switchPlayer');
        const part: Part = this.currentPart;
        const currentPlayer: Player = Player.fromTurn(part.doc.turn);
        this.currentPlayer = this.players[this.gameComponent.rules.node.gameState.turn % 2].get();
        const currentOpponent: Player = currentPlayer.getOpponent();
        if (this.didUserPlay(currentOpponent)) {
            this.pauseCountDownsFor(currentOpponent);
        }
        if (this.didUserPlay(currentPlayer)) {
            display(OnlineGameWrapperComponent.VERBOSE,
                    'OnlineGameWrapperComponent.onCurrentPartUpdate: changing current player');
            this.resumeCountDownFor(currentPlayer);
        } else {
            this.startCountDownFor(currentPlayer);
        }
    }
    public resetChronoFor(player: Player): void {
        this.pauseCountDownsFor(player);
        this.resumeCountDownFor(player);
    }
    private applyEndGame() {
        // currently working for normal victory, resign, and timeouts!
        const currentPart: Part = this.currentPart;
        const player: Player = Player.fromTurn(currentPart.doc.turn);
        this.endGame = true;
        const lastMoveResult: MGPResult[] = [MGPResult.VICTORY, MGPResult.HARD_DRAW];
        const endGameIsMove: boolean = lastMoveResult.some((r: MGPResult) => r.value === currentPart.doc.result);
        if (endGameIsMove) {
            this.doNewMoves(this.currentPart);
        } else {
            const endGameResults: MGPResult[] = [
                MGPResult.RESIGN,
                MGPResult.TIMEOUT,
                MGPResult.HARD_DRAW,
                MGPResult.AGREED_DRAW_BY_ZERO,
                MGPResult.AGREED_DRAW_BY_ONE,
            ];
            const resultIsIncluded: boolean =
                endGameResults.some((result: MGPResult) => result.value === currentPart.doc.result);
            assert(resultIsIncluded === true, 'Unknown type of end game (' + currentPart.doc.result + ')');
            display(OnlineGameWrapperComponent.VERBOSE, 'endGame est true et winner est ' + currentPart.getWinner());
        }
        this.stopCountdownsFor(player);
    }
    public notifyDraw(encodedMove: JSONValueWithoutArray, scores?: [number, number]): Promise<void> {
        this.endGame = true;
        const user: Player = this.getPlayer();
        return this.gameService.updateDBBoard(this.currentPartId, user, encodedMove, [0, 0], scores, true);
    }
    public notifyTimeoutVictory(victoriousPlayer: string, user: Player, lastIndex: number, loser: string): void {
        this.endGame = true;

        // TODO: should the part be updated here? Or instead should we wait for the update from firestore?
        const wonPart: Part = this.currentPart.setWinnerAndLoser(victoriousPlayer, loser);
        this.currentPart = wonPart;

        this.gameService.notifyTimeout(this.currentPartId, user, lastIndex, victoriousPlayer, loser);
    }
    public notifyVictory(encodedMove: JSONValueWithoutArray, scores?: [number, number]): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.notifyVictory');

        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node);
        if (gameStatus === GameStatus.ONE_WON) {
            this.currentPart = this.currentPart.setWinnerAndLoser(this.players[1].get(), this.players[0].get());
        } else {
            assert(gameStatus === GameStatus.ZERO_WON, 'impossible to get a victory without winner!');
            this.currentPart = this.currentPart.setWinnerAndLoser(this.players[0].get(), this.players[1].get());
        }
        this.endGame = true;
        const user: Player = this.getPlayer();

        return this.gameService.updateDBBoard(this.currentPartId,
                                              user,
                                              encodedMove,
                                              [0, 0],
                                              scores,
                                              false,
                                              this.currentPart.getWinner().get(),
                                              this.currentPart.getLoser().get());
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
        if (takeBackRequester === Player.NONE) {
            return false;
        } else {
            return this.isOpponent(takeBackRequester);
        }
    }
    private getTakeBackRequester(): Player {
        if (this.currentPart == null) {
            return Player.NONE;
        }
        const request: Request | null | undefined = this.currentPart.doc.request;
        if (request && request.code === 'TakeBackAsked') {
            return Request.getPlayer(request);
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
                   Request.getPlayer(this.currentPart.doc.request) === this.getPlayer().getOpponent())
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
        const request: Request | null | undefined = this.currentPart.doc.request;
        if (request && request.code === 'DrawProposed') {
            return Request.getPlayer(request);
        } else {
            return Player.NONE;
        }
    }
    protected async onRequest(request: Request, oldPart: Part): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, { called: 'OnlineGameWrapper.onRequest(', request, oldPart });
        switch (request.code) {
            case 'TakeBackAsked':
                break;
            case 'TakeBackRefused':
                break;
            case 'TakeBackAccepted':
                this.previousUpdateWasATakeBack = true;
                this.takeBackTo(this.currentPart.doc.turn);
                break;
            case 'RematchProposed':
                this.rematchProposed = true;
                const opponent: Player = Request.getPlayer(request).getOpponent();
                if (this.isPlayer(opponent)) {
                    display(OnlineGameWrapperComponent.VERBOSE, 'ton adversaire te propose une revanche');
                    this.opponentProposedRematch = true;
                }
                break;
            case 'RematchAccepted':
                await this.router.navigate(['/nextGameLoading']);
                await this.router.navigate(['/play/' + Request.getTypeGame(request) + '/' + Request.getPartId(request)]);
                break;
            case 'DrawProposed':
                break;
            case 'DrawRefused':
                break;
            case 'TurnTimeAdded':
                const addedTurnTime: number = 30 * 1000;
                const localPlayer: Player = Player.of(request.data['player']);
                this.addTurnTimeTo(localPlayer, addedTurnTime);
                break;
            case 'GlobalTimeAdded':
                const addedGlobalTime: number = 5 * 60 * 1000;
                const globalPlayer: Player = Player.of(request.data['player']);
                this.addGlobalTimeTo(globalPlayer, addedGlobalTime);
                break;
            default:
                Utils.expectToBe(request.code, 'DrawAccepted', 'Unknown RequestType : ' + request.code + ' for ' + JSON.stringify(request));
                this.acceptDraw();
                break;
        }
    }
    public takeBackTo(turn: number): void {
        this.gameComponent.rules.node = this.gameComponent.rules.node.mother.get();
        if (this.gameComponent.rules.node.gameState.turn === turn) {
            this.switchPlayer();
        } else {
            // Second time to make sure it end up on player's turn
            this.gameComponent.rules.node = this.gameComponent.rules.node.mother.get();
            const player: Player = Player.fromTurn(turn);
            this.resetChronoFor(player);
        }
        this.gameComponent.updateBoard();
    }
    public setPlayersDatas(updatedICurrentPart: Part): void {
        display(OnlineGameWrapperComponent.VERBOSE ||true, { OnlineGameWrapper_setPlayersDatas: updatedICurrentPart });
        this.players = [
            MGPOptional.of(updatedICurrentPart.doc.playerZero),
            MGPOptional.ofNullable(updatedICurrentPart.doc.playerOne),
        ];
        assert(updatedICurrentPart.doc.playerOne != null, 'should not setPlayersDatas when players data is not received');
        this.currentPlayer = this.players[updatedICurrentPart.doc.turn % 2].get();
        let opponentName: MGPOptional<string> = MGPOptional.empty();
        if (this.players[0].equalsValue(this.getPlayerName())) {
            this.observerRole = Player.ZERO.value;
            opponentName = this.players[1];
        } else if (this.players[1].equalsValue(this.getPlayerName())) {
            this.observerRole = Player.ONE.value;
            opponentName = this.players[0];
        } else {
            this.observerRole = Player.NONE.value;
        }
        if (opponentName.isPresent()) {
            const onDocumentCreated: (foundUser: IUserId[]) => void = (foundUser: IUserId[]) => {
                this.opponent = foundUser[0];
            };
            const onDocumentModified: (modifiedUsers: IUserId[]) => void = (modifiedUsers: IUserId[]) => {
                this.opponent = modifiedUsers[0];
            };
            const onDocumentDeleted: (deletedUsers: IUserId[]) => void = (deletedUsers: IUserId[]) => {
                throw new Error('OnlineGameWrapper: Opponent was deleted, what sorcery is this: ' +
                                JSON.stringify(deletedUsers));
            };
            const callback: FirebaseCollectionObserver<IUser> =
                new FirebaseCollectionObserver(onDocumentCreated,
                                               onDocumentModified,
                                               onDocumentDeleted);
            this.opponentSubscription =
                MGPOptional.of(this.userService.observeUserByUsername(opponentName.get(), callback));
        }
    }
    public async onLegalUserMove(move: Move, scores?: [number, number]): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'dans OnlineGameWrapperComponent.onLegalUserMove');
        if (this.isOpponentWaitingForTakeBackResponse()) {
            this.gameComponent.message('You must answer to take back request');
        } else {
            return this.updateDBBoard(move, this.msToSubstract, scores);
        }
    }
    public async updateDBBoard(move: Move,
                               msToSubstract: [number, number],
                               scores?: [number, number])
    : Promise<void>
    {
        const encodedMove: JSONValueWithoutArray = this.gameComponent.encoder.encodeMove(move);
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.updateDBBoard(' + move.toString() +
                                                    ', ' + scores + ')');
        this.gameComponent.rules.choose(move);
        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node);
        if (gameStatus.isEndGame) {
            if (gameStatus === GameStatus.DRAW) {
                return this.notifyDraw(encodedMove, scores);
            } else {
                return this.notifyVictory(encodedMove, scores);
            }
        } else {
            if (this.previousUpdateWasATakeBack === true) {
                msToSubstract = [0, 0];
            }
            const user: Player = this.getPlayer();
            return this.gameService.updateDBBoard(this.currentPartId,
                                                  user,
                                                  encodedMove,
                                                  msToSubstract,
                                                  scores);
        }
    }
    public resign(): void {
        const lastIndex: number = this.getLastIndex();
        const user: Player = this.getPlayer();
        const resigner: string = this.players[this.observerRole % 2].get();
        const victoriousOpponent: string = this.players[(this.observerRole + 1) % 2].get();
        this.gameService.resign(this.currentPartId, user, lastIndex, victoriousOpponent, resigner);
    }
    private getLastIndex(): number {
        return this.currentPart.doc.lastUpdate.index;
    }
    public reachedOutOfTime(player: 0 | 1): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.reachedOutOfTime(' + player + ')');
        const lastIndex: number = this.getLastIndex();
        const user: Player = this.getPlayer();
        this.stopCountdownsFor(Player.of(player));
        const opponent: IUserId = Utils.getNonNullable(this.opponent);
        if (player === this.observerRole) {
            // the player has run out of time, he'll notify his own defeat by time
            this.notifyTimeoutVictory(Utils.getNonNullable(opponent.doc.username),
                                      user,
                                      lastIndex,
                                      this.getPlayerName());
        } else {
            if (this.endGame) {
                display(true, 'time might be better handled in the future');
            } else if (this.opponentIsOffline()) { // the other player has timed out
                this.notifyTimeoutVictory(this.getPlayerName(),
                                          user,
                                          player,
                                          Utils.getNonNullable(opponent.doc.username));
                this.endGame = true;
            }
        }
    }
    public acceptRematch(): boolean {
        if (this.isPlaying() === false) { // TODOTODO eeeeeh
            return false;
        }
        const currentPartId: ICurrentPartId = {
            id: this.currentPartId,
            doc: this.currentPart.doc,
        };
        const user: Player = this.getPlayer();
        const lastIndex: number = this.getLastIndex();
        this.gameService.acceptRematch(currentPartId, user, lastIndex);
        return true;
    }
    public proposeRematch(): boolean {
        if (this.isPlaying() === false) { // TODOTODO eeeeh
            return false;
        }
        const user: Player = this.getPlayer();
        const lastIndex: number = this.getLastIndex();
        this.gameService.proposeRematch(this.currentPartId, lastIndex, user);
        return true;
    }
    public proposeDraw(): void {
        const user: Player = this.getPlayer();
        const lastIndex: number = this.getLastIndex();
        this.gameService.proposeDraw(this.currentPartId, lastIndex, user);
    }
    public acceptDraw(): void {
        const lastIndex: number = this.getLastIndex();
        const user: Player = this.getPlayer();
        this.gameService.acceptDraw(this.currentPartId, lastIndex, user);
    }
    public refuseDraw(): void {
        const user: Player = this.getPlayer();
        const lastIndex: number = this.getLastIndex();
        this.gameService.refuseDraw(this.currentPartId, lastIndex, user);
    }
    public askTakeBack(): void {
        const user: Player = this.getPlayer();
        const lastIndex: number = this.getLastIndex();
        this.gameService.askTakeBack(this.currentPartId, lastIndex, user);
    }
    public acceptTakeBack(): void {
        const player: Player = this.getPlayer();
        this.gameService.acceptTakeBack(this.currentPartId, this.currentPart, player, this.msToSubstract);
        this.msToSubstract = [0, 0];
    }
    public refuseTakeBack(): void {
        const user: Player = this.getPlayer();
        const lastIndex: number = this.getLastIndex();
        this.gameService.refuseTakeBack(this.currentPartId, lastIndex, user);
    }
    public startCountDownFor(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE,
                'dans OnlineGameWrapperComponent.startCountDownFor(' + player.toString() +
                ') (turn ' + this.currentPart.doc.turn + ')');
        this.hasUserPlayed[player.value] = true;
        if (player === Player.ZERO) {
            this.chronoZeroGlobal.start();
            this.chronoZeroTurn.start();
        } else {
            this.chronoOneGlobal.start();
            this.chronoOneTurn.start();
        }
    }
    public resumeCountDownFor(player: Player, resetTurn: boolean = true): void {
        display(OnlineGameWrapperComponent.VERBOSE,
                'dans OnlineGameWrapperComponent.resumeCountDownFor(' + player.toString() +
                ') (turn ' + this.currentPart.doc.turn + ')');

        let turnChrono: CountDownComponent;
        if (player === Player.ZERO) {
            this.chronoZeroGlobal.changeDuration(Utils.getNonNullable(this.currentPart.doc.remainingMsForZero));
            this.chronoZeroGlobal.resume();
            turnChrono = this.chronoZeroTurn;
        } else {
            this.chronoOneGlobal.changeDuration(Utils.getNonNullable(this.currentPart.doc.remainingMsForOne));
            this.chronoOneGlobal.resume();
            turnChrono = this.chronoOneTurn;
        }

        if (resetTurn) {
            turnChrono.setDuration(this.joiner.maximalMoveDuration * 1000);
            turnChrono.start();
        } else {
            turnChrono.resume();
        }
    }
    public pauseCountDownsFor(player: Player, stopTurn: boolean = true): void {
        display(OnlineGameWrapperComponent.VERBOSE,
                'dans OnlineGameWrapperComponent.pauseCountDownFor(' + player.value +
                ') (turn ' + this.currentPart.doc.turn + ')');
        let turnChrono: CountDownComponent;
        if (player === Player.ZERO) {
            this.chronoZeroGlobal.pause();
            turnChrono = this.chronoZeroTurn;
        } else {
            this.chronoOneGlobal.pause();
            turnChrono = this.chronoOneTurn;
        }

        if (stopTurn) {
            turnChrono.stop();
        } else {
            turnChrono.pause();
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
            if (this.chronoZeroTurn.isStarted()) {
                this.chronoZeroTurn.stop();
            }
        } else {
            if (this.chronoOneGlobal.isStarted()) {
                this.chronoOneGlobal.stop();
            }
            if (this.chronoOneTurn.isStarted()) {
                this.chronoOneTurn.stop();
            }
        }
    }
    public getPlayerNameClass(player: number): string {
        if (this.opponentIsOffline()) {
            return 'has-text-grey-light';
        } else {
            if (player === 0) {
                return 'has-text-white';
            } else {
                return 'has-text-black';
            }
        }
    }
    public getBoardHighlight(): string[] {
        if (this.endGame) {
            return ['endgame-bg'];
        }
        if (this.isUserCurrentPlayer()) {
            return ['player' + this.getPlayer().value + '-bg'];
        }
        return [];
    }
    private isUserCurrentPlayer(): boolean {
        return this.gameComponent != null &&
               this.observerRole === this.gameComponent.rules.node.gameState.turn % 2;
    }
    public opponentIsOffline(): boolean {
        return this.opponent != null &&
               this.opponent.doc.state === 'offline';
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
    public addGlobalTime(): Promise<void> {
        const giver: Player = this.getPlayer();
        const lastIndex: number = this.getLastIndex();
        return this.gameService.addGlobalTime(this.currentPartId, lastIndex, this.currentPart, giver);
    }
    public addTurnTime(): Promise<void> {
        const giver: Player = this.getPlayer();
        const lastIndex: number = this.getLastIndex();
        return this.gameService.addTurnTime(giver, lastIndex, this.currentPartId);
    }
    public addTurnTimeTo(player: Player, addedMs: number): void {
        const currentPlayer: Player = Player.fromTurn(this.currentPart.getTurn());
        this.pauseCountDownsFor(currentPlayer, false);
        if (player === Player.ZERO) {
            const currentDuration: number = this.chronoZeroTurn.remainingMs;
            this.chronoZeroTurn.changeDuration(currentDuration + addedMs);
        } else {
            const currentDuration: number = this.chronoOneTurn.remainingMs;
            this.chronoOneTurn.changeDuration(currentDuration + addedMs);
        }
        this.resumeCountDownFor(currentPlayer, false);
    }
    public addGlobalTimeTo(player: Player, addedMs: number): void {
        if (player === Player.ZERO) {
            const currentDuration: number = this.chronoZeroGlobal.remainingMs;
            this.chronoZeroGlobal.changeDuration(currentDuration + addedMs);
        } else {
            const currentDuration: number = this.chronoOneGlobal.remainingMs;
            this.chronoOneGlobal.changeDuration(currentDuration + addedMs);
        }
    }
    public ngOnDestroy(): void {
        if (this.routerEventsSub != null && this.routerEventsSub.unsubscribe != null) {
            this.routerEventsSub.unsubscribe();
        }
        if (this.userSub != null && this.userSub.unsubscribe != null) {
            this.userSub.unsubscribe();
        }
        if (this.gameStarted === true) {
            if (this.opponentSubscription.isPresent()) {
                this.opponentSubscription.get()();
            }
            this.gameService.stopObserving();
        }
    }
}
