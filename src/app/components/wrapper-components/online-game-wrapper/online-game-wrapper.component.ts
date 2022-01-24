import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { GameService } from 'src/app/services/GameService';
import { UserService } from 'src/app/services/UserService';
import { Move } from '../../../jscaip/Move';
import { Part, MGPResult, PartDocument } from '../../../domain/Part';
import { CountDownComponent } from '../../normal-component/count-down/count-down.component';
import { PartCreationComponent } from '../part-creation/part-creation.component';
import { User, UserDocument } from '../../../domain/User';
import { Request } from '../../../domain/Request';
import { GameWrapper } from '../GameWrapper';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';
import { Joiner } from 'src/app/domain/Joiner';
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
    public currentPart: PartDocument;
    public currentPartId: string;
    public gameStarted: boolean = false;
    public opponent: User | null = null;
    public playerName: string | null = null;
    public currentPlayer: string;

    public rematchProposed: boolean = false;
    public opponentProposedRematch: boolean = false;

    public joiner: Joiner;

    private hasUserPlayed: [boolean, boolean] = [false, false];
    private msToSubstract: [number, number] = [0, 0];
    private previousUpdateWasATakeBack: boolean = false;

    protected routerEventsSub!: Subscription; // Initialized in ngOnInit
    protected userSub!: Subscription; // Initialized in ngOnInit
    protected opponentSubscription: MGPOptional<() => void> = MGPOptional.empty();

    public readonly OFFLINE_FONT_COLOR: { [key: string]: string} = { color: 'lightgrey' };

    public readonly globalTimeMessage: string = $localize`5 minutes`;
    public readonly turnTimeMessage: string = $localize`30 seconds`;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                private readonly router: Router,
                private readonly userService: UserService,
                authenticationService: AuthenticationService,
                private readonly gameService: GameService)
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
            await this.router.navigate([page]);
        }
    }
    private setCurrentPartIdOrRedirect(): Promise<void> {
        this.currentPartId = this.extractPartIdFromURL();
        return this.redirectIfPartIsInvalid();
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
    public async startGame(iJoiner: Joiner): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startGame');

        assert(this.gameStarted === false, 'Should not start already started game');
        this.joiner = iJoiner;

        this.gameStarted = true;
        setTimeout(async() => {
            // the small waiting is there to make sur that the chronos are charged by view
            this.afterGameIncluderViewInit();
            await this.startPart();
        }, 1);
    }
    protected startPart(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startPart');

        // TODO: don't start count down for Observer.
        this.gameService.startObserving(this.currentPartId, async(part: MGPOptional<Part>) => {
            assert(part.isPresent(), 'OnlineGameWrapper observed a part being deleted, this should not happen');
            await this.onCurrentPartUpdate(part.get());
        });
    }
    private async onCurrentPartUpdate(update: Part): Promise<void> {
        const part: PartDocument = new PartDocument(this.currentPartId, update);
        display(OnlineGameWrapperComponent.VERBOSE, { OnlineGameWrapperComponent_onCurrentPartUpdate: {
            before: this.currentPart, then: update.doc, before_part_turn: part.data.turn,
            before_state_turn: this.gameComponent.rules.node.gameState.turn, nbPlayedMoves: part.data.listMoves.length,
        } });
        const updateType: UpdateType = this.getUpdateType(part);
        const turn: number = update.turn;
        if (updateType === UpdateType.REQUEST) {
            display(OnlineGameWrapperComponent.VERBOSE, 'UpdateType: Request(' + Utils.getNonNullable(part.data.request).code + ') (' + turn + ')');
        } else {
            display(OnlineGameWrapperComponent.VERBOSE, 'UpdateType: ' + updateType.value + '(' + turn + ')');
        }
        const oldPart: PartDocument = this.currentPart;
        this.currentPart = part;

        switch (updateType) {
            case UpdateType.REQUEST:
                return await this.onRequest(Utils.getNonNullable(part.data.request), oldPart);
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
                                                           oldPart.data.beginning == null;
                const newPartHasBeginningTime: boolean = this.currentPart == null ||
                                                         this.currentPart.data.beginning != null;
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
    public getUpdateType(update: PartDocument): UpdateType {
        const currentPartDoc: Part | null = this.currentPart != null ? this.currentPart.data : null;
        const diff: ObjectDifference = ObjectDifference.from(currentPartDoc, update.data);
        display(OnlineGameWrapperComponent.VERBOSE, { diff });
        const nbDiffs: number = diff.countChanges();
        if (nbDiffs === 0) {
            return UpdateType.DUPLICATE;
        }
        if (update.data.request) {
            const lastMoveTimeIsRemoved: boolean = diff.removed['lastMoveTime'] != null;
            if (update.data.request.code === 'TakeBackAccepted' && lastMoveTimeIsRemoved) {
                return UpdateType.ACCEPT_TAKE_BACK_WITHOUT_TIME;
            } else {
                return UpdateType.REQUEST;
            }
        }
        if (this.isMove(diff, nbDiffs)) {
            if (update.data.turn === 1) {
                if (update.data.lastMoveTime == null) {
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
        if (update.data.beginning == null) {
            return UpdateType.PRE_START_DOC;
        }
        if (update.data.result !== MGPResult.UNACHIEVED.value) {
            const turnModified: boolean = diff.modified['turn'] != null;
            const lastMoveTimeMissing: boolean = diff.modified['lastMoveTime'] == null;
            if (turnModified && lastMoveTimeMissing) {
                return UpdateType.END_GAME_WITHOUT_TIME;
            } else {
                return UpdateType.END_GAME;
            }
        }
        assert(update.data.beginning != null && update.data.listMoves.length === 0,
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
    public getLastMoveTime(oldPart: PartDocument, update: PartDocument, type: UpdateType): [number, number] {
        const oldTime: Time | null = this.getMoreRecentTime(oldPart);
        const updateTime: Time | null= this.getMoreRecentTime(update);
        assert(oldTime != null, 'TODO: OLD_TIME WAS NULL, UNDO COMMENT AND TEST!');
        assert(updateTime != null, 'TODO UPDATE_TIME WAS NULL, UNDO COMMENT AND TEST!');
        const last: Player = Player.fromTurn(oldPart.data.turn);
        return this.getTimeUsedForLastTurn(Utils.getNonNullable(oldTime),
                                           Utils.getNonNullable(updateTime),
                                           type, last);
    }
    private getMoreRecentTime(part: PartDocument): Time | null {
        if (part.data.lastMoveTime == null) {
            return part.data.beginning as Time;
        } else {
            return part.data.lastMoveTime as Time;
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
    private doNewMoves(part: PartDocument) {
        this.switchPlayer();
        const listMoves: JSONValue[] = ArrayUtils.copyImmutableArray(part.data.listMoves);
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
        const part: PartDocument = this.currentPart;
        const currentPlayer: Player = Player.fromTurn(part.data.turn);
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
        const currentPart: PartDocument = this.currentPart;
        const player: Player = Player.fromTurn(currentPart.data.turn);
        this.endGame = true;
        const lastMoveResult: MGPResult[] = [MGPResult.VICTORY, MGPResult.HARD_DRAW];
        const finalUpdateIsMove: boolean = lastMoveResult.some((r: MGPResult) => r.value === currentPart.data.result);
        if (finalUpdateIsMove) {
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
                endGameResults.some((result: MGPResult) => result.value === currentPart.data.result);
            assert(resultIsIncluded === true, 'Unknown type of end game (' + currentPart.data.result + ')');
            display(OnlineGameWrapperComponent.VERBOSE, 'endGame est true et winner est ' + currentPart.getWinner());
        }
        this.stopCountdownsFor(player);
    }
    public notifyDraw(encodedMove: JSONValueWithoutArray, scores?: [number, number]): Promise<void> {
        this.endGame = true;
        const user: Player = this.getPlayer();
        return this.gameService.updateDBBoard(this.currentPartId, user, encodedMove, [0, 0], scores, true);
    }
    public async notifyTimeoutVictory(victoriousPlayer: string,
                                      user: Player,
                                      lastIndex: number,
                                      loser: string)
    : Promise<void>
    {
        this.endGame = true;

        // TODO: should the part be updated here? Or instead should we wait for the update from firestore?
        const wonPart: PartDocument = this.currentPart.setWinnerAndLoser(victoriousPlayer, loser);
        this.currentPart = wonPart;

        await this.gameService.notifyTimeout(this.currentPartId, user, lastIndex, victoriousPlayer, loser);
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
        assert(this.isPlaying(), 'Non playing should not call canAskTakeBack');
        if (this.currentPart == null) {
            return false;
        } else if (this.currentPart.data.turn <= this.observerRole) {
            return false;
        } else if (this.currentPart.data.request &&
                   this.currentPart.data.request.code === 'TakeBackRefused' &&
                   this.currentPart.data.request.data['player'] === this.getPlayer().getOpponent().value)
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
        const request: Request | null | undefined = this.currentPart.data.request;
        if (request && request.code === 'TakeBackAsked') {
            return Request.getPlayer(request);
        } else {
            return Player.NONE;
        }
    }
    public canProposeDraw(): boolean {
        assert(this.isPlaying(), 'Non playing should not call canProposeDraw');
        if (this.endGame) {
            return false;
        } else if (this.currentPart == null) {
            return false;
        } else if (this.currentPart.data.request &&
                   this.currentPart.data.request.code === 'DrawRefused' &&
                   Request.getPlayer(this.currentPart.data.request) === this.getPlayer().getOpponent())
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
        const request: Request | null | undefined = this.currentPart.data.request;
        if (request && request.code === 'DrawProposed') {
            return Request.getPlayer(request);
        } else {
            return Player.NONE;
        }
    }
    protected async onRequest(request: Request, oldPart: PartDocument): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, { called: 'OnlineGameWrapper.onRequest(', request, oldPart });
        switch (request.code) {
            case 'TakeBackAsked':
                break;
            case 'TakeBackRefused':
                break;
            case 'TakeBackAccepted':
                this.previousUpdateWasATakeBack = true;
                this.takeBackTo(this.currentPart.data.turn);
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
                await this.router.navigate(['/play/', Request.getTypeGame(request), Request.getPartId(request)]);
                break;
            case 'DrawProposed':
                break;
            case 'DrawRefused':
                break;
            case 'AddTurnTime':
                const addedTurnTime: number = 30 * 1000;
                const localPlayer: Player = Player.of(request.data['player']);
                this.addTurnTimeTo(localPlayer, addedTurnTime);
                break;
            case 'AddGlobalTime':
                const addedGlobalTime: number = 5 * 60 * 1000;
                const globalPlayer: Player = Player.of(request.data['player']);
                this.addGlobalTimeTo(globalPlayer, addedGlobalTime);
                break;
            default:
                Utils.expectToBe(request.code, 'DrawAccepted', 'Unknown RequestType : ' + request.code + ' for ' + JSON.stringify(request));
                await this.acceptDraw();
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
    public setPlayersDatas(updatedICurrentPart: PartDocument): void {
        display(OnlineGameWrapperComponent.VERBOSE, { OnlineGameWrapper_setPlayersDatas: updatedICurrentPart });
        this.players = [
            MGPOptional.of(updatedICurrentPart.data.playerZero),
            MGPOptional.ofNullable(updatedICurrentPart.data.playerOne),
        ];
        assert(updatedICurrentPart.data.playerOne != null, 'should not setPlayersDatas when players data is not received');
        this.currentPlayer = this.players[updatedICurrentPart.data.turn % 2].get();
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
            const onDocumentCreated: (foundUser: UserDocument[]) => void = (foundUser: UserDocument[]) => {
                this.opponent = foundUser[0].data;
            };
            const onDocumentModified: (modifiedUsers: UserDocument[]) => void = (modifiedUsers: UserDocument[]) => {
                this.opponent = modifiedUsers[0].data;
            };
            const onDocumentDeleted: (deletedUsers: UserDocument[]) => void = (deletedUsers: UserDocument[]) => {
                throw new Error('OnlineGameWrapper: Opponent was deleted, what sorcery is this: ' +
                    JSON.stringify(deletedUsers));
            };
            const callback: FirebaseCollectionObserver<User> =
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
    public async resign(): Promise<void> {
        const lastIndex: number = this.getLastIndex();
        const user: Player = this.getPlayer();
        const resigner: string = this.players[this.observerRole % 2].get();
        const victoriousOpponent: string = this.players[(this.observerRole + 1) % 2].get();
        await this.gameService.resign(this.currentPartId, lastIndex, user, victoriousOpponent, resigner);
    }
    private getLastIndex(): number {
        return this.currentPart.data.lastUpdate.index;
    }
    public async reachedOutOfTime(player: 0 | 1): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.reachedOutOfTime(' + player + ')');
        const lastIndex: number = this.getLastIndex();
        const user: Player = this.getPlayer();
        this.stopCountdownsFor(Player.of(player));
        const opponent: User = Utils.getNonNullable(this.opponent);
        if (player === this.observerRole) {
            // the player has run out of time, he'll notify his own defeat by time
            const victoriousPlayer: string = Utils.getNonNullable(opponent.username);
            await this.notifyTimeoutVictory(victoriousPlayer, user, lastIndex, this.getPlayerName());
        } else {
            if (this.endGame) {
                display(true, 'time might be better handled in the future');
            } else if (this.opponentIsOffline()) { // the other player has timed out
                const loosingPlayer: string = Utils.getNonNullable(opponent.username);
                await this.notifyTimeoutVictory(this.getPlayerName(), user, player, loosingPlayer);
                this.endGame = true;
            }
        }
    }
    public async acceptRematch(): Promise<boolean> {
        assert(this.isPlaying(), 'Non playing should not call acceptRematch');
        const currentPartDocument: PartDocument = new PartDocument(this.currentPartId, this.currentPart.data);
        await this.gameService.acceptRematch(currentPartDocument, this.getLastIndex(), this.getPlayer());
        return true;
    }
    public async proposeRematch(): Promise<boolean> {
        assert(this.isPlaying(), 'Non playing should not call proposeRematch');
        await this.gameService.proposeRematch(this.currentPartId, this.getLastIndex(), this.getPlayer());
        return true;
    }
    public proposeDraw(): Promise<void> {
        return this.gameService.proposeDraw(this.currentPartId, this.getLastIndex(), this.getPlayer());
    }
    public acceptDraw(): Promise<void> {
        return this.gameService.acceptDraw(this. currentPartId, this.getLastIndex(), this.getPlayer());
    }
    public refuseDraw(): Promise<void> {
        return this.gameService.refuseDraw(this.currentPartId, this.getLastIndex(), this.getPlayer());
    }
    public askTakeBack(): Promise<void> {
        return this.gameService.askTakeBack(this.currentPartId, this.getLastIndex(), this.getPlayer());
    }
    public async acceptTakeBack(): Promise<void> {
        const user: Player = this.getPlayer();
        await this.gameService.acceptTakeBack(this.currentPartId, this.currentPart, user, this.msToSubstract);
        this.msToSubstract = [0, 0];
    }
    public refuseTakeBack(): Promise<void> {
        return this.gameService.refuseTakeBack(this.currentPartId, this.getLastIndex(), this.getPlayer());
    }
    public startCountDownFor(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE,
                'dans OnlineGameWrapperComponent.startCountDownFor(' + player.toString() +
                ') (turn ' + this.currentPart.data.turn + ')');
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
                ') (turn ' + this.currentPart.data.turn + ')');

        let turnChrono: CountDownComponent;
        if (player === Player.ZERO) {
            this.chronoZeroGlobal.changeDuration(Utils.getNonNullable(this.currentPart.data.remainingMsForZero));
            this.chronoZeroGlobal.resume();
            turnChrono = this.chronoZeroTurn;
        } else {
            this.chronoOneGlobal.changeDuration(Utils.getNonNullable(this.currentPart.data.remainingMsForOne));
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
                ') (turn ' + this.currentPart.data.turn + ')');
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
                ') (turn ' + this.currentPart.data.turn + ')');

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
    public opponentIsOffline(): boolean {
        return this.opponent != null &&
               this.opponent.state === 'offline';
    }
    public canResign(): boolean {
        assert(this.isPlaying(), 'Non playing should not call canResign');
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
        return this.gameService.addGlobalTime(this.currentPartId, lastIndex, this.currentPart.data, giver);
    }
    public addTurnTime(): Promise<void> {
        const giver: Player = this.getPlayer();
        return this.gameService.addTurnTime(giver, this.getLastIndex(), this.currentPartId);
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
