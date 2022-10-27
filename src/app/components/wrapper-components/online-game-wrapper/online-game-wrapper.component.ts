import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { GameService } from 'src/app/services/GameService';
import { UserService } from 'src/app/services/UserService';
import { Move } from '../../../jscaip/Move';
import { Part, MGPResult, PartDocument } from '../../../domain/Part';
import { CountDownComponent } from '../../normal-component/count-down/count-down.component';
import { PartCreationComponent } from '../part-creation/part-creation.component';
import { User } from '../../../domain/User';
import { Request } from '../../../domain/Request';
import { GameWrapper, GameWrapperMessages } from '../GameWrapper';
import { ConfigRoom } from 'src/app/domain/ConfigRoom';
import { ChatComponent } from '../../normal-component/chat/chat.component';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display, JSONValue, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { ObjectDifference } from 'src/app/utils/ObjectUtils';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { getMillisecondsDifference } from 'src/app/utils/TimeUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameState } from 'src/app/jscaip/GameState';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { Localized } from 'src/app/utils/LocaleUtils';
import { Timestamp } from 'firebase/firestore';
import { MinimalUser } from 'src/app/domain/MinimalUser';

export class OnlineGameWrapperMessages {

    public static readonly NO_MATCHING_PART: Localized = () => $localize`The game you tried to join does not exist.`;
}

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
export class OnlineGameWrapperComponent extends GameWrapper<MinimalUser> implements OnInit, OnDestroy {

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
    public opponent: MinimalUser | null = null;
    public authUser: AuthUser;
    public currentPlayer: MinimalUser;

    public rematchProposed: boolean = false;
    public opponentProposedRematch: boolean = false;

    public configRoom: ConfigRoom;

    private hasUserPlayed: [boolean, boolean] = [false, false];
    private msToSubstract: [number, number] = [0, 0];

    private routerEventsSub!: Subscription; // Initialized in ngOnInit
    private userSub!: Subscription; // Initialized in ngOnInit
    private opponentSubscription: Subscription = new Subscription();
    private partSubscription: Subscription = new Subscription();

    public readonly OFFLINE_FONT_COLOR: { [key: string]: string} = { color: 'lightgrey' };

    public readonly globalTimeMessage: string = $localize`5 minutes`;
    public readonly turnTimeMessage: string = $localize`30 seconds`;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                router: Router,
                messageDisplayer: MessageDisplayer,
                connectedUserService: ConnectedUserService,
                private readonly userService: UserService,
                private readonly gameService: GameService)
    {
        super(componentFactoryResolver, actRoute, connectedUserService, router, messageDisplayer);
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent constructed');
    }
    private extractPartIdFromURL(): string {
        return Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('id'));
    }
    private extractGameNameFromURL(): string {
        // url is ["play", "game-name", "part-id"]
        return Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('compo'));
    }
    public isPlaying(): boolean {
        return this.role.isPlayer();
    }
    public getPlayer(): MinimalUser {
        return this.authUser.toMinimalUser();
    }
    private isPlayer(player: Player): boolean {
        return this.role === player;
    }
    private isOpponent(player: PlayerOrNone): boolean {
        return this.role !== player;
    }
    private async redirectIfPartOrGameIsInvalid(): Promise<void> {
        const gameURL: string = this.extractGameNameFromURL();
        const gameExists: boolean = GameInfo.ALL_GAMES().some((gameInfo: GameInfo) => gameInfo.urlName === gameURL);
        if (gameExists) {
            const partValidity: MGPValidation =
                await this.gameService.getPartValidity(this.currentPartId, gameURL);
            if (partValidity.isFailure()) {
                this.routerEventsSub.unsubscribe();
                const message: string = OnlineGameWrapperMessages.NO_MATCHING_PART();
                await this.router.navigate(['/notFound', message], { skipLocationChange: true } );
            }
        } else {
            this.routerEventsSub.unsubscribe();
            const message: string = GameWrapperMessages.NO_MATCHING_GAME(gameURL);
            await this.router.navigate(['/notFound', message], { skipLocationChange: true } );
        }
    }
    private setCurrentPartIdOrRedirect(): Promise<void> {
        this.currentPartId = this.extractPartIdFromURL();
        return this.redirectIfPartOrGameIsInvalid();
    }
    public async ngOnInit(): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnInit');

        this.routerEventsSub = this.router.events.subscribe(async(ev: Event) => {
            if (ev instanceof NavigationEnd) {
                await this.setCurrentPartIdOrRedirect();
            }
        });
        this.userSub = this.connectedUserService.subscribeToUser((user: AuthUser) => {
            // player should be authenticated and have a username to be here
            this.authUser = user;
        });
        await this.setCurrentPartIdOrRedirect();
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnInit done');
    }
    public async startGame(configRoom: ConfigRoom): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startGame');

        assert(this.gameStarted === false, 'Should not start already started game');
        this.configRoom = configRoom;

        this.gameStarted = true;
        window.setTimeout(async() => {
            // the small waiting is there to make sur that the chronos are charged by view
            const createdSuccessfully: boolean = await this.afterViewInit();
            assert(createdSuccessfully, 'Game should be created successfully, otherwise part-creation would have redirected');
            this.startPart();
        }, 1);
    }
    protected startPart(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startPart');

        // TODO: don't start count down for Observer.
        this.partSubscription =
            this.gameService.subscribeToChanges(this.currentPartId, async(part: MGPOptional<Part>) => {
                assert(part.isPresent(), 'OnlineGameWrapper observed a part being deleted, this should not happen');
                await this.onCurrentPartUpdate(part.get());
            });
    }
    private async onCurrentPartUpdate(update: Part): Promise<void> {
        const part: PartDocument = new PartDocument(this.currentPartId, update);
        display(OnlineGameWrapperComponent.VERBOSE, { OnlineGameWrapperComponent_onCurrentPartUpdate: {
            before: this.currentPart, then: update.data, before_part_turn: part.data.turn,
            before_state_turn: this.gameComponent.getTurn(), nbPlayedMoves: part.data.listMoves.length,
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
                this.msToSubstract = this.getLastUpdateTime(oldPart, part, updateType);
                return this.doNewMoves(part);
            case UpdateType.PRE_START_DOC:
                const oldPartHadNoBeginningTime: boolean = oldPart == null || oldPart.data.beginning == null;
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
            const lastMoveTimeIsRemoved: boolean = diff.removed.lastUpdateTime != null;
            if (update.data.request.code === 'TakeBackAccepted' && lastMoveTimeIsRemoved) {
                return UpdateType.ACCEPT_TAKE_BACK_WITHOUT_TIME;
            } else {
                return UpdateType.REQUEST;
            }
        }
        if (this.isMove(diff, nbDiffs)) {
            if (update.data.turn === 1) {
                if (update.data.lastUpdateTime == null) {
                    return UpdateType.MOVE_WITHOUT_TIME;
                } else {
                    return UpdateType.MOVE;
                }
            } else {
                if (diff.modified.lastUpdateTime == null) {
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
            const turnModified: boolean = diff.modified.turn != null;
            const lastUpdateTimeMissing: boolean = diff.modified.lastUpdateTime == null;
            if (turnModified && lastUpdateTimeMissing) {
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
        if (diff.modified.listMoves != null && diff.modified.turn != null) {
            const modifOnListMovesTurnAndLastUpdateFields: number = 3;
            const lastUpdateTimeModified: number = diff.isPresent('lastUpdateTime').present ? 1 : 0;
            const scoreZeroUpdated: number = diff.isPresent('scorePlayerZero').present ? 1 : 0;
            const scoreOneUpdated: number = diff.isPresent('scorePlayerOne').present ? 1 : 0;
            const remainingMsForZeroUpdated: number = diff.isPresent('remainingMsForZero').present ? 1 : 0;
            const remainingMsForOneUpdated: number = diff.isPresent('remainingMsForOne').present ? 1 : 0;
            const requestRemoved: number = diff.removed.request == null ? 0 : 1;
            const nbValidMoveDiffs: number = lastUpdateTimeModified +
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
    public getLastUpdateTime(oldPart: PartDocument, update: PartDocument, type: UpdateType): [number, number] {
        const oldTime: Timestamp | null = this.getMoreRecentTime(oldPart);
        const updateTime: Timestamp | null= this.getMoreRecentTime(update);
        assert(oldTime != null, 'oldTime should not be null');
        assert(updateTime != null, 'updateTime should not be null');
        const last: Player = Player.fromTurn(oldPart.data.turn);
        return this.getTimeUsedForLastTurn(Utils.getNonNullable(oldTime),
                                           Utils.getNonNullable(updateTime),
                                           type, last);
    }
    private getMoreRecentTime(part: PartDocument): Timestamp | null {
        if (part.data.lastUpdateTime == null) {
            return part.data.beginning as Timestamp;
        } else {
            return part.data.lastUpdateTime as Timestamp;
        }
    }
    private getTimeUsedForLastTurn(oldTime: Timestamp,
                                   updateTime: Timestamp,
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
        this.chronoZeroGlobal.setDuration(this.configRoom.totalPartDuration * 1000);
        this.chronoOneGlobal.setDuration(this.configRoom.totalPartDuration * 1000);

        this.chronoZeroTurn.setDuration(this.configRoom.maximalMoveDuration * 1000);
        this.chronoOneTurn.setDuration(this.configRoom.maximalMoveDuration * 1000);
    }
    private didUserPlay(player: Player): boolean {
        return this.hasUserPlayed[player.value];
    }
    private doNewMoves(part: PartDocument) {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.doNewMoves');
        this.switchPlayer();
        const listMoves: JSONValue[] = ArrayUtils.copyImmutableArray(part.data.listMoves);
        const rules: Rules<Move, GameState, unknown> = this.gameComponent.rules;
        while (this.gameComponent.getTurn() < listMoves.length) {
            const currentPartTurn: number = this.gameComponent.getTurn();
            const chosenMove: Move = this.gameComponent.encoder.decode(listMoves[currentPartTurn]);
            const legality: MGPFallible<unknown> = rules.isLegal(chosenMove, this.gameComponent.getState());
            const message: string = 'We received an incorrect db move: ' + chosenMove.toString() +
                                    ' in ' + listMoves + ' at turn ' + currentPartTurn +
                                    'because "' + legality.getReasonOr('') + '"';
            assert(legality.isSuccess(), message);
            rules.choose(chosenMove);
        }
        this.currentPlayer = this.players[this.gameComponent.getTurn() % 2].get();
        this.gameComponent.updateBoard();
    }
    public switchPlayer(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.switchPlayer');
        const part: PartDocument = this.currentPart;
        const currentPlayer: Player = Player.fromTurn(part.data.turn);
        this.currentPlayer = this.players[this.gameComponent.getTurn() % 2].get();
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
        const player: Player = this.role as Player;
        return this.gameService.updateDBBoard(this.currentPartId, player, encodedMove, [0, 0], scores, true);
    }
    public async notifyTimeoutVictory(victoriousPlayer: MinimalUser,
                                      user: Player,
                                      lastIndex: number,
                                      loser: MinimalUser)
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
        const player: Player = this.role as Player;

        return this.gameService.updateDBBoard(this.currentPartId,
                                              player,
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
        } else if (this.currentPart.data.turn <= this.role.value) {
            return false;
        } else if (this.currentPart.data.request &&
                   this.currentPart.data.request.code === 'TakeBackRefused' &&
                   this.role.isPlayer() &&
                   // eslint-disable-next-line dot-notation
                   this.currentPart.data.request.data['player'] === this.role.getOpponent().value)
        {
            return false;
        } else if (this.getTakeBackRequester() === PlayerOrNone.NONE) {
            return true;
        } else {
            return false;
        }
    }
    public isOpponentWaitingForTakeBackResponse(): boolean {
        const takeBackRequester: PlayerOrNone = this.getTakeBackRequester();
        if (takeBackRequester.isPlayer()) {
            return this.isOpponent(takeBackRequester);
        } else {
            return false;
        }
    }
    private getTakeBackRequester(): PlayerOrNone {
        if (this.currentPart == null) {
            return PlayerOrNone.NONE;
        }
        const request: Request | null | undefined = this.currentPart.data.request;
        if (request && request.code === 'TakeBackAsked') {
            return Request.getPlayer(request);
        } else {
            return PlayerOrNone.NONE;
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
                   this.role.isPlayer() &&
                   Request.getPlayer(this.currentPart.data.request) === this.role.getOpponent())
        {
            return false;
        } else if (this.isOpponentWaitingForDrawResponse()) {
            return false;
        } else if (this.getDrawRequester() === PlayerOrNone.NONE) {
            return true;
        } else {
            return false;
        }
    }
    public isOpponentWaitingForDrawResponse(): boolean {
        const drawRequester: PlayerOrNone = this.getDrawRequester();
        if (drawRequester === PlayerOrNone.NONE) return false;
        return this.isOpponent(drawRequester);
    }
    private getDrawRequester(): PlayerOrNone {
        if (this.currentPart == null) {
            return PlayerOrNone.NONE;
        }
        const request: Request | null | undefined = this.currentPart.data.request;
        if (request && request.code === 'DrawProposed') {
            return Request.getPlayer(request);
        } else {
            return PlayerOrNone.NONE;
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
                await this.router.navigate(['/play', Request.getTypeGame(request), Request.getPartId(request)]);
                break;
            case 'DrawProposed':
                break;
            case 'DrawRefused':
                break;
            case 'AddTurnTime':
                const addedTurnTime: number = 30 * 1000;
                // eslint-disable-next-line dot-notation
                const localPlayer: Player = Player.of(request.data['player']);
                this.addTurnTimeTo(localPlayer, addedTurnTime);
                break;
            case 'AddGlobalTime':
                const addedGlobalTime: number = 5 * 60 * 1000;
                // eslint-disable-next-line dot-notation
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
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.takeBackTo');
        this.gameComponent.rules.node = this.gameComponent.rules.node.mother.get();
        if (this.gameComponent.getTurn() === turn) {
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
        let opponent: MGPOptional<MinimalUser> = MGPOptional.empty();
        if (this.players[0].get().id === this.authUser.id) {
            this.setRole(Player.ZERO);
            opponent = this.players[1];
        } else if (this.players[1].get().id === this.authUser.id) {
            this.setRole(Player.ONE);
            opponent = this.players[0];
        } else {
            this.setRole(PlayerOrNone.NONE);
        }
        if (opponent.isPresent()) {
            const callback: (user: MGPOptional<User>) => void = (user: MGPOptional<User>) => {
                assert(user.isPresent(), 'opponent was deleted, what sorcery is this');
                this.opponent = { id: opponent.get().id, name: Utils.getNonNullable(user.get().username) };
            };
            this.opponentSubscription =
                this.userService.observeUser(opponent.get().id, callback);
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
            const player: Player = this.role as Player;
            return this.gameService.updateDBBoard(this.currentPartId,
                                                  player,
                                                  encodedMove,
                                                  msToSubstract,
                                                  scores);
        }
    }
    public async resign(): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.resign');
        const lastIndex: number = this.getLastIndex();
        const player: Player = this.role as Player;
        const resigner: MinimalUser = this.getPlayer();
        const victoriousOpponent: MinimalUser = this.players[(this.role.value + 1) % 2].get();
        await this.gameService.resign(this.currentPartId, lastIndex, player, victoriousOpponent, resigner);
    }
    private getLastIndex(): number {
        return this.currentPart.data.lastUpdate.index;
    }
    public async reachedOutOfTime(player: Player): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.reachedOutOfTime(' + player + ')');
        const lastIndex: number = this.getLastIndex();
        const currentPlayer: Player = this.role as Player;
        this.stopCountdownsFor(player);
        if (player === this.role) {
            // the player has run out of time, he'll notify his own defeat by time
            const opponent: MinimalUser = Utils.getNonNullable(this.opponent);
            await this.notifyTimeoutVictory(opponent, currentPlayer, lastIndex, this.authUser.toMinimalUser());
        } else {
            assert(this.endGame === false, 'time might be better handled in the future');
            if (this.opponentIsOffline()) { // the other player has timed out
                const opponent: MinimalUser = Utils.getNonNullable(this.opponent);
                await this.notifyTimeoutVictory(this.authUser.toMinimalUser(), currentPlayer, player.value, opponent);
                this.endGame = true;
            }
        }
    }
    public async acceptRematch(): Promise<boolean> {
        assert(this.isPlaying(), 'Non playing should not call acceptRematch');
        const currentPartDocument: PartDocument = new PartDocument(this.currentPartId, this.currentPart.data);
        await this.gameService.acceptRematch(currentPartDocument, this.getLastIndex(), this.role as Player);
        return true;
    }
    public async proposeRematch(): Promise<boolean> {
        assert(this.isPlaying(), 'Non playing should not call proposeRematch');
        await this.gameService.proposeRematch(this.currentPartId, this.getLastIndex(), this.role as Player);
        return true;
    }
    public proposeDraw(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call proposeDraw');
        return this.gameService.proposeDraw(this.currentPartId, this.getLastIndex(), this.role as Player);
    }
    public acceptDraw(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call acceptDraw');
        return this.gameService.acceptDraw(this. currentPartId, this.getLastIndex(), this.role as Player);
    }
    public refuseDraw(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call refuseDraw');
        return this.gameService.refuseDraw(this.currentPartId, this.getLastIndex(), this.role as Player);
    }
    public askTakeBack(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call askTakeBack');
        return this.gameService.askTakeBack(this.currentPartId, this.getLastIndex(), this.role as Player);
    }
    public async acceptTakeBack(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call acceptTakeBack');
        const player: Player = this.role as Player;
        await this.gameService.acceptTakeBack(this.currentPartId, this.currentPart, player, this.msToSubstract);
        this.msToSubstract = [0, 0];
    }
    public refuseTakeBack(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call refuseTakeBack');
        return this.gameService.refuseTakeBack(this.currentPartId, this.getLastIndex(), this.role as Player);
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
            turnChrono.setDuration(this.configRoom.maximalMoveDuration * 1000);
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
    public getPlayerNameClass(player: Player): string {
        if (this.opponentIsOffline()) {
            return 'has-text-grey-light';
        } else {
            if (player === Player.ZERO) {
                return 'has-text-white';
            } else {
                return 'has-text-black';
            }
        }
    }
    public opponentIsOffline(): boolean {
        return false; // TODO FIRST
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
        const giver: Player = this.role as Player;
        const lastIndex: number = this.getLastIndex();
        return this.gameService.addGlobalTime(this.currentPartId, lastIndex, this.currentPart.data, giver);
    }
    public addTurnTime(): Promise<void> {
        const giver: Player = this.role as Player;
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
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnDestroy');
        this.routerEventsSub.unsubscribe();
        this.userSub.unsubscribe();
        if (this.gameStarted === true) {
            this.opponentSubscription.unsubscribe();
            this.partSubscription.unsubscribe();
        }
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnDestroy finished');
    }
}
