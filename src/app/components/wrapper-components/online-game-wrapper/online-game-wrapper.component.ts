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
import { FocusedPart, User } from '../../../domain/User';
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
import { ObservedPartService } from 'src/app/services/ObservedPartService';

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
    public currentPart: PartDocument | null = null;
    public currentPartId!: string; // Initialized in ngOnInit
    public gameStarted: boolean = false;
    public opponent: MinimalUser | null = null;
    public authUser!: AuthUser; // Initialized in ngOnInit
    public currentPlayer: MinimalUser | null = null;

    public rematchProposed: boolean = false;
    public opponentProposedRematch: boolean = false;
    private userLinkedToThisPart: boolean = true;

    public configRoom: ConfigRoom;
    public observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();

    private hasUserPlayed: [boolean, boolean] = [false, false];
    private msToSubstract: [number, number] = [0, 0];

    private routerEventsSubscription!: Subscription; // Initialized in ngOnInit
    private userSubscription!: Subscription; // Initialized in ngOnInit
    private opponentSubscription: Subscription = new Subscription();
    private partSubscription: Subscription = new Subscription();
    private observedPartSubscription: Subscription = new Subscription();

    public readonly OFFLINE_FONT_COLOR: { [key: string]: string} = { color: 'lightgrey' };

    public readonly globalTimeMessage: string = $localize`5 minutes`;
    public readonly turnTimeMessage: string = $localize`30 seconds`;

    private onCurrentUpdateOngoing: boolean = false;

    public constructor(componentFactoryResolver: ComponentFactoryResolver,
                       actRoute: ActivatedRoute,
                       connectedUserService: ConnectedUserService,
                       router: Router,
                       messageDisplayer: MessageDisplayer,
                       private readonly observedPartService: ObservedPartService,
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
    private async redirectIfPartOrGameIsInvalid(): Promise<void> {
        const gameURL: string = this.extractGameNameFromURL();
        const gameExists: boolean = GameInfo.ALL_GAMES().some((gameInfo: GameInfo) => gameInfo.urlName === gameURL);
        if (gameExists) {
            const partValidity: MGPValidation =
                await this.gameService.getPartValidity(this.currentPartId, gameURL);
            if (partValidity.isFailure()) {
                this.routerEventsSubscription.unsubscribe();
                const message: string = OnlineGameWrapperMessages.NO_MATCHING_PART();
                await this.router.navigate(['/notFound', message], { skipLocationChange: true } );
            }
        } else {
            this.routerEventsSubscription.unsubscribe();
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

        this.routerEventsSubscription = this.router.events.subscribe(async(ev: Event) => {
            if (ev instanceof NavigationEnd) {
                await this.setCurrentPartIdOrRedirect();
            }
        });
        this.userSubscription = this.connectedUserService.subscribeToUser((user: AuthUser) => {
            // player should be authenticated and have a username to be here
            this.authUser = user;
        });
        await this.setCurrentPartIdOrRedirect();
        // onObservedPartUpdate needs to access to currentPartId, so it must do it after setCurrentPartIdOrRedirect
        this.observedPartSubscription = this.observedPartService.subscribeToObservedPart(
            (async(part: MGPOptional<FocusedPart>) => {
                await this.onObservedPartUpdate(part);
            }));
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnInit done');
    }
    /**
      * Here you can only be an observer or a player
      * (creator, candidate and chosen opponent being only for non started game)
      * If you are player, it is impossible that you start creating/joining a part
      * If you are observer, you can join this part as observer in another tab
      * then, if you quit this tab, you become unlinked to this part in here
      * then, if you start creating a game, this tab should go back to the lobby
      * because user that are playing should not see other players playing
      */
    private async onObservedPartUpdate(part: MGPOptional<FocusedPart>): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.onObservedPartUpdate called');
        if (part.isPresent()) {
            const newPart: FocusedPart = part.get();
            if (newPart.role === 'Observer' || newPart.id === this.currentPartId) {
                // if we learn that other tabs are observer
                // or that other tabs are from the same part
                // then nothing is to be done here
                this.observedPart = part;
            } else {
                // we learn that we are active in another part (typically creating another game) so we quit
                this.userLinkedToThisPart = false;
                await this.router.navigate(['/lobby']);
            }
        } else {
            this.observedPart = MGPOptional.empty();
        }
    }
    public getObservedPart(): MGPOptional<FocusedPart> {
        return this.observedPart;
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
        }, 2);
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
    private async onCurrentPartUpdate(update: Part, attempt: number = 5): Promise<void> {
        const part: PartDocument = new PartDocument(this.currentPartId, update);
        display(OnlineGameWrapperComponent.VERBOSE, { OnlineGameWrapperComponent_onCurrentPartUpdate: {
            before: this.currentPart,
            then: update,
            before_part_turn: part.data.turn,
            before_state_turn: this.gameComponent.rules.node.gameState.turn,
            nbPlayedMoves: part.data.listMoves.length,
        } });
        if (this.onCurrentUpdateOngoing) {
            attempt -= 1;
            assert(attempt > 0, 'Update took more than 5sec to be handled by the component!');
            window.setTimeout(async() => {
                await this.onCurrentPartUpdate(update, attempt);
            }, 1000);
            return;
        } else {
            this.onCurrentUpdateOngoing = true;
        }
        const updatesTypes: UpdateType[] = this.getUpdateTypes(part);
        const turn: number = update.turn;
        if (updatesTypes.includes(UpdateType.REQUEST)) {
            display(OnlineGameWrapperComponent.VERBOSE, 'UpdateType: Request(' + Utils.getNonNullable(part.data.request).code + ') (' + turn + ')');
        } else {
            display(OnlineGameWrapperComponent.VERBOSE, 'UpdateType: ' + updatesTypes.map((u: UpdateType) => u.value) + '(' + turn + ')');
        }
        const oldPart: PartDocument | null = this.currentPart;
        this.currentPart = part;

        for (const updateType of updatesTypes) {
            await this.applyUpdate(updateType, part, oldPart);
        }
        this.onCurrentUpdateOngoing = false;
    }
    private async applyUpdate(updateType: UpdateType, part: PartDocument, oldPart: PartDocument | null): Promise<void> {
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
                const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
                const actualOldPart: PartDocument = Utils.getNonNullable(oldPart);
                currentPart.data = {
                    ...currentPart.data,
                    turn: currentPart.data.turn - 1,
                    lastUpdate: actualOldPart.data.lastUpdate,
                    lastUpdateTime: actualOldPart.data.lastUpdateTime,
                    listMoves: currentPart.data.listMoves.slice(0, currentPart.data.listMoves.length - 1),
                };
                return;
            case UpdateType.MOVE:
                this.msToSubstract = this.getLastUpdateTime(oldPart, part);
                return this.doNewMoves(part);
            case UpdateType.PRE_START_DOC:
                return;
            default:
                assert(updateType === UpdateType.STARTING_DOC, 'Unexpected update type ' + updateType);
                return this.startCountDown(part);
        }
    }
    private async startCountDown(part: PartDocument): Promise<void> {
        this.setChronos();
        await this.setPlayersDatas(part);
        if (part.data.listMoves.length === 0) {
            this.startCountDownFor(Player.ZERO);
        } else {
            this.startCountDownFor(Player.fromTurn(part.data.turn - 1));
        }
    }
    public getUpdateTypes(update: PartDocument): UpdateType[] {
        const currentPartDoc: Part | null = this.currentPart != null ? this.currentPart.data : null;
        const diff: ObjectDifference = ObjectDifference.from(currentPartDoc, update.data);
        const updatesTypes: UpdateType[] = [];
        display(OnlineGameWrapperComponent.VERBOSE, { currentPartDoc, update, diff });
        const nbDiffs: number = diff.countChanges();
        if (nbDiffs === 0) {
            updatesTypes.push(UpdateType.DUPLICATE);
        }
        if (diff.isFullyCreated() && diff.isPresent('beginning').present) {
            updatesTypes.push(UpdateType.STARTING_DOC);
        }
        if (update.data.request) {
            const lastMoveTimeIsRemoved: boolean = diff.removed.lastUpdateTime != null;
            if (update.data.request.code === 'TakeBackAccepted' && lastMoveTimeIsRemoved) {
                updatesTypes.push(UpdateType.ACCEPT_TAKE_BACK_WITHOUT_TIME);
            } else {
                updatesTypes.push(UpdateType.REQUEST);
            }
        }
        if (currentPartDoc == null) {
            if (diff.isPresent('listMoves').state === 'added' && update.data.turn > 0) {
                updatesTypes.push(this.getMoveUpdateType(update, diff));
            }
        } else if (this.turnHasIncreased(currentPartDoc.turn, update.data.turn, update.data.listMoves)) {
            updatesTypes.push(this.getMoveUpdateType(update, diff));
        }
        if (update.data.beginning == null) {
            updatesTypes.push(UpdateType.PRE_START_DOC);
        }
        if (diff.isPresent('result').present &&
            update.data.result !== MGPResult.UNACHIEVED.value)
        {
            const turnModified: boolean = diff.modified.turn != null;
            const lastUpdateTimeMissing: boolean = diff.addedOrModified('lastUpdateTime') === false;
            if (turnModified && lastUpdateTimeMissing) {
                updatesTypes.push(UpdateType.END_GAME_WITHOUT_TIME);
            } else {
                updatesTypes.push(UpdateType.END_GAME);
            }
        }
        return updatesTypes;
    }
    private getMoveUpdateType(update: PartDocument, diff: ObjectDifference): UpdateType {
        if (update.data.turn === 1) {
            if (update.data.lastUpdateTime == null) {
                return UpdateType.MOVE_WITHOUT_TIME;
            } else {
                return UpdateType.MOVE;
            }
        } else {
            if (diff.modified.lastUpdateTime == null && diff.added.lastUpdateTime == null) {
                return UpdateType.MOVE_WITHOUT_TIME;
            } else {
                return UpdateType.MOVE;
            }
        }
    }
    public turnHasIncreased(previousTurn: number, newTurn: number, listMoves: readonly JSONValueWithoutArray[])
    : boolean
    {
        assert(listMoves.length === newTurn, 'ListMoves size and newTurn do not match, it is impossible!');
        return previousTurn < newTurn;
    }
    public getLastUpdateTime(oldPart: PartDocument | null, update: PartDocument): [number, number] {
        if (oldPart == null) {
            return [0, 0];
        }
        const oldTime: Timestamp | null = this.getMoreRecentTime(oldPart);
        const updateTime: Timestamp | null= this.getMoreRecentTime(update);
        assert(oldTime != null, 'oldTime should not be null');
        assert(updateTime != null, 'updateTime should not be null');
        const last: Player = Player.fromTurn(oldPart.data.turn);
        return this.getTimeUsedForLastTurn(Utils.getNonNullable(oldTime),
                                           Utils.getNonNullable(updateTime),
                                           last);
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
    private doNewMoves(part: PartDocument): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.doNewMoves' + JSON.stringify(part));
        this.switchPlayer();
        const listMoves: JSONValue[] = ArrayUtils.copyImmutableArray(part.data.listMoves);
        const rules: Rules<Move, GameState, unknown> = this.gameComponent.rules;
        while (this.gameComponent.getTurn() < listMoves.length) {
            const currentPartTurn: number = this.gameComponent.getTurn();
            const chosenMove: Move = this.gameComponent.encoder.decode(listMoves[currentPartTurn]);
            const legality: MGPFallible<unknown> = rules.isLegal(chosenMove, this.gameComponent.getState());
            const stringListMoves: string = JSON.stringify(listMoves);
            const message: string = 'We received an incorrect db move: ' + chosenMove.toString() +
                                    ' in ' + stringListMoves + ' at turn ' + currentPartTurn +
                                    'because "' + legality.getReasonOr('') + '"';
            if (legality.isFailure()) {
                console.log(message);
                console.log(listMoves);
            }
            assert(legality.isSuccess(), message);
            rules.choose(chosenMove);
        }
        this.currentPlayer = this.players[this.gameComponent.getTurn() % 2].get();
        this.gameComponent.updateBoard();
    }
    public switchPlayer(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.switchPlayer');
        const part: PartDocument = Utils.getNonNullable(this.currentPart);
        const currentPlayer: Player = Player.fromTurn(part.data.turn);
        this.currentPlayer = this.players[this.gameComponent.getTurn() % 2].get();
        const currentOpponent: Player = currentPlayer.getOpponent();
        this.pauseCountDownsFor(currentOpponent);
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
    private async applyEndGame(): Promise<void> {
        // currently working for normal victory, resign, and timeouts!
        await this.observedPartService.removeObservedPart();
        const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
        const player: Player = Player.fromTurn(currentPart.data.turn);
        this.endGame = true;
        const lastMoveResult: MGPResult[] = [MGPResult.VICTORY, MGPResult.HARD_DRAW];
        const finalUpdateIsMove: boolean = lastMoveResult.some((r: MGPResult) => r.value === currentPart.data.result);
        if (finalUpdateIsMove === false) {
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
            const log: string = 'endGame is true and winner is ' + currentPart.getWinner().getOrElse({ id: 'fake', name: 'no one' }).name;
            display(OnlineGameWrapperComponent.VERBOSE, log);
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
        const wonPart: PartDocument = Utils.getNonNullable(this.currentPart).setWinnerAndLoser(victoriousPlayer, loser);
        this.currentPart = wonPart;

        await this.gameService.notifyTimeout(this.currentPartId, user, lastIndex, victoriousPlayer, loser);
    }
    public notifyVictory(encodedMove: JSONValueWithoutArray, scores?: [number, number]): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.notifyVictory');

        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node);
        const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
        const playerZero: MinimalUser = this.players[0].get();
        const playerOne: MinimalUser = this.players[1].get();
        if (gameStatus === GameStatus.ONE_WON) {
            this.currentPart = currentPart.setWinnerAndLoser(playerOne, playerZero);
        } else {
            assert(gameStatus === GameStatus.ZERO_WON, 'impossible to get a victory without winner!');
            this.currentPart = currentPart.setWinnerAndLoser(playerZero, playerOne);
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
        assert(this.currentPart != null, 'should not call canAskTakeBack when currentPart is not defined yet');
        const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
        if (currentPart.data.turn <= this.role.value) {
            return false;
        } else if (currentPart.data.request &&
                   currentPart.data.request.code === 'TakeBackRefused' &&
                   this.role.isPlayer() &&
                   // eslint-disable-next-line dot-notation
                   currentPart.data.request.data['player'] === this.role.getOpponent().value)
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
            return takeBackRequester !== this.role;
        } else {
            return false;
        }
    }
    private getTakeBackRequester(): PlayerOrNone {
        const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
        const request: Request | null | undefined = currentPart.data.request;
        if (request && request.code === 'TakeBackAsked') {
            return Request.getPlayer(request);
        } else {
            return PlayerOrNone.NONE;
        }
    }
    public canProposeDraw(): boolean {
        assert(this.isPlaying(), 'Non playing should not call canProposeDraw');
        const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
        if (this.endGame) {
            return false;
        } else if (currentPart.data.request &&
                   currentPart.data.request.code === 'DrawRefused' &&
                   this.role.isPlayer() &&
                   Request.getPlayer(currentPart.data.request) === this.role.getOpponent())
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
        return drawRequester !== this.role;
    }
    private getDrawRequester(): PlayerOrNone {
        const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
        const request: Request | null | undefined = currentPart.data.request;
        if (request && request.code === 'DrawProposed') {
            return Request.getPlayer(request);
        } else {
            return PlayerOrNone.NONE;
        }
    }
    protected async onRequest(request: Request, oldPart: PartDocument | null): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, { called: 'OnlineGameWrapper.onRequest(', request, oldPart });
        switch (request.code) {
            case 'TakeBackAsked':
                break;
            case 'TakeBackRefused':
                break;
            case 'TakeBackAccepted':
                this.takeBackTo(Utils.getNonNullable(this.currentPart).data.turn);
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
            default:
                Utils.expectToBe(request.code, 'AddGlobalTime', 'Unknown RequestType : ' + request.code + ' for ' + JSON.stringify(request));
                const addedGlobalTime: number = 5 * 60 * 1000;
                // eslint-disable-next-line dot-notation
                const globalPlayer: Player = Player.of(request.data['player']);
                this.addGlobalTimeTo(globalPlayer, addedGlobalTime);
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
    public async setPlayersDatas(updatedICurrentPart: PartDocument): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, { OnlineGameWrapper_setPlayersDatas: updatedICurrentPart });
        this.players = [
            MGPOptional.of(updatedICurrentPart.data.playerZero),
            MGPOptional.ofNullable(updatedICurrentPart.data.playerOne),
        ];
        assert(updatedICurrentPart.data.playerOne != null, 'should not setPlayersDatas when players data is not received');
        this.currentPlayer = this.players[updatedICurrentPart.data.turn % 2].get();
        const opponent: MGPOptional<MinimalUser> = await this.setRealObserverRole();
        if (opponent.isPresent()) {
            const callback: (user: MGPOptional<User>) => void = (user: MGPOptional<User>) => {
                assert(user.isPresent(), 'opponent was deleted, what sorcery is this');
                this.opponent = opponent.get();
            };
            this.opponentSubscription =
                this.userService.observeUser(opponent.get().id, callback);
        }
    }
    public async setRealObserverRole(): Promise<MGPOptional<MinimalUser>> {
        let opponent: MGPOptional<MinimalUser> = MGPOptional.empty();
        if (this.players[0].equalsValue(this.getPlayer())) {
            this.setRole(Player.ZERO);
            opponent = this.players[1];
        } else if (this.players[1].equalsValue(this.getPlayer())) {
            this.setRole(Player.ONE);
            opponent = this.players[0];
        } else {
            this.setRole(PlayerOrNone.NONE);
        }
        await this.observedPartService.updateObservedPart({
            ...this.observedPart.get(),
            role: this.role === PlayerOrNone.NONE ? 'Observer' : 'Player',
        });
        return opponent;
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
        return Utils.getNonNullable(this.currentPart).data.lastUpdate.index;
    }
    public async reachedOutOfTime(player: Player): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.reachedOutOfTime(' + player + ')');
        const lastIndex: number = this.getLastIndex();
        const currentPlayer: Player = this.role as Player;
        this.stopCountdownsFor(player);
        if (this.isPlaying() === false) {
            return;
        }
        const opponent: MinimalUser = Utils.getNonNullable(this.opponent);
        if (player === this.role) {
            // the player has run out of time, he'll notify his own defeat by time
            await this.notifyTimeoutVictory(opponent, currentPlayer, lastIndex, this.authUser.toMinimalUser());
        } else {
            assert(this.endGame === false, 'time might be better handled in the future');
            if (this.opponentIsOffline()) { // the other player has timed out
                await this.notifyTimeoutVictory(this.authUser.toMinimalUser(), currentPlayer, player.value, opponent);
                this.endGame = true;
            }
        }
    }
    public async acceptRematch(): Promise<boolean> {
        assert(this.isPlaying(), 'Non playing should not call acceptRematch');
        const currentPartDocument: PartDocument =
            new PartDocument(this.currentPartId, Utils.getNonNullable(this.currentPart).data);
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
        await this.gameService.acceptTakeBack(this.currentPartId,
                                              Utils.getNonNullable(this.currentPart),
                                              player,
                                              this.msToSubstract);
        this.msToSubstract = [0, 0];
    }
    public refuseTakeBack(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call refuseTakeBack');
        return this.gameService.refuseTakeBack(this.currentPartId, this.getLastIndex(), this.role as Player);
    }
    public startCountDownFor(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE,
                'dans OnlineGameWrapperComponent.startCountDownFor(' + player.toString() +
                ') (turn ' + Utils.getNonNullable(this.currentPart).data.turn + ')');
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
                ') (turn ' + Utils.getNonNullable(this.currentPart).data.turn + ')');

        let turnChrono: CountDownComponent;
        if (player === Player.ZERO) {
            this.chronoZeroGlobal.changeDuration(Utils.getNonNullable(this.currentPart?.data.remainingMsForZero));
            this.chronoZeroGlobal.resume();
            turnChrono = this.chronoZeroTurn;
        } else {
            this.chronoOneGlobal.changeDuration(Utils.getNonNullable(this.currentPart?.data.remainingMsForOne));
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
                ') (turn ' + this.currentPart?.data.turn + ')');
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
    private stopCountdownsFor(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE,
                'cdc::stopCountDownsFor(' + player.toString() +
                ') (turn ' + this.currentPart?.data.turn + ')');

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
        return this.opponent != null;
    }
    public addGlobalTime(): Promise<void> {
        const giver: Player = this.role as Player;
        const lastIndex: number = this.getLastIndex();
        return this.gameService.addGlobalTime(this.currentPartId,
                                              lastIndex,
                                              Utils.getNonNullable(this.currentPart).data,
                                              giver);
    }
    public addTurnTime(): Promise<void> {
        const giver: Player = this.role as Player;
        return this.gameService.addTurnTime(giver, this.getLastIndex(), this.currentPartId);
    }
    public addTurnTimeTo(player: Player, addedMs: number): void {
        const currentPlayer: Player = Player.fromTurn(Utils.getNonNullable(this.currentPart).getTurn());
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
    public onCancelMove(reason?: string): void {
        this.gameComponent.showLastMove();
    }
    public async ngOnDestroy(): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnDestroy');
        this.routerEventsSubscription.unsubscribe();
        this.userSubscription.unsubscribe();
        this.observedPartSubscription.unsubscribe();
        if (this.isPlaying() === false && this.userLinkedToThisPart) {
            await this.observedPartService.removeObservedPart();
        }
        if (this.gameStarted === true) {
            this.opponentSubscription.unsubscribe();
            this.partSubscription.unsubscribe();
        }
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnDestroy finished');
    }
}
