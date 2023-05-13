import { Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { GameService } from 'src/app/services/GameService';
import { UserService } from 'src/app/services/UserService';
import { Move } from '../../../jscaip/Move';
import { Part, MGPResult, PartDocument, PartEvent, PartEventMove, PartEventRequest, PartEventReply, PartEventAction } from '../../../domain/Part';
import { CountDownComponent } from '../../normal-component/count-down/count-down.component';
import { PartCreationComponent } from '../part-creation/part-creation.component';
import { FocusedPart, User } from '../../../domain/User';
import { GameWrapper, GameWrapperMessages } from '../GameWrapper';
import { ConfigRoom } from 'src/app/domain/ConfigRoom';
import { ChatComponent } from '../../normal-component/chat/chat.component';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { ObjectDifference } from 'src/app/utils/ObjectUtils';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameState } from 'src/app/jscaip/GameState';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { ObservedPartService } from 'src/app/services/ObservedPartService';
import { PartService } from 'src/app/services/PartService';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Timestamp } from 'firebase/firestore';
import { getMillisecondsElapsed } from 'src/app/utils/TimeUtils';

export class OnlineGameWrapperMessages {

    public static readonly NO_MATCHING_PART: Localized = () => $localize`The game you tried to join does not exist.`;
}

export class UpdateType {

    public static readonly PRE_START_DOC: UpdateType = new UpdateType('PRE_START_DOC');

    public static readonly STARTING_DOC: UpdateType = new UpdateType('STARTING_DOC');

    public static readonly DUPLICATE: UpdateType = new UpdateType('DUPLICATE');

    public static readonly END_GAME: UpdateType = new UpdateType('END_GAME');

    public static readonly END_GAME_WITHOUT_TIME: UpdateType = new UpdateType('END_GAME_WITHOUT_TIME');

    private constructor(public readonly value: string) {}
}


function showTimestamp(t: Timestamp): string {
    if (t == null) return 'null';
    return Math.floor(t.seconds % (60*60) / 60) + ':' + (t.seconds % 60) + ':' + (t.nanoseconds / 1000000)
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

    private lastRequestOrReply: MGPOptional<PartEventRequest | PartEventReply> = MGPOptional.empty();

    public configRoom: ConfigRoom;
    public observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();

    private routerEventsSubscription!: Subscription; // Initialized in ngOnInit
    private userSubscription!: Subscription; // Initialized in ngOnInit
    private opponentSubscription: Subscription = new Subscription();
    private partSubscription: Subscription = new Subscription();
    private eventsSubscription: Subscription = new Subscription();
    private observedPartSubscription: Subscription = new Subscription();

    public readonly OFFLINE_FONT_COLOR: { [key: string]: string} = { color: 'lightgrey' };

    public readonly globalTimeMessage: string = $localize`5 minutes`;
    public readonly turnTimeMessage: string = $localize`30 seconds`;

    public constructor(actRoute: ActivatedRoute,
                       connectedUserService: ConnectedUserService,
                       router: Router,
                       messageDisplayer: MessageDisplayer,
                       private readonly observedPartService: ObservedPartService,
                       private readonly userService: UserService,
                       private readonly gameService: GameService,
                       private readonly partService: PartService,
                       private readonly timeManager: OGWCTimeManagerService)
    {
        super(actRoute, connectedUserService, router, messageDisplayer);
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent constructed');
    }
    // Gets the server time by relying on the presence token of the user.
    private async getServerTime(): Promise<Timestamp> {
        const userId: string = this.connectedUserService.user.get().id;
        // We force the presence token update, and once we receive it, check the time written by firebase
        return new Promise((resolve: (result: Timestamp) => void) => {
            let updateSent: boolean = false;
            const callback = (user: MGPOptional<User>): void => {
                console.log({updateSent, time: showTimestamp(user.get().lastUpdateTime as Timestamp)});
                if (updateSent && user.get().lastUpdateTime != null) {
                    subscription.unsubscribe();
                    resolve(user.get().lastUpdateTime as Timestamp);
                }
                if (user.get().lastUpdateTime == null) {
                    // We know that the update has been sent when we actually see a null here
                    updateSent = true;
                }
            };
            const subscription: Subscription = this.userService.observeUser(userId, callback);
            console.log('sending token')
            this.userService.updatePresenceToken(userId);
        });
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
    public async startGame(configRoom: ConfigRoom): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startGame');

        assert(this.gameStarted === false, 'Should not start already started game');
        this.configRoom = configRoom;

        this.gameStarted = true;
        window.setTimeout(async() => {
            // the small waiting is there to make sure that the chronos are charged by view
            const createdSuccessfully: boolean = await this.afterViewInit();
            this.timeManager.setClocks([this.chronoZeroTurn, this.chronoOneTurn],
                                       [this.chronoZeroGlobal, this.chronoOneGlobal]);
            assert(createdSuccessfully, 'Game should be created successfully, otherwise part-creation would have redirected');
            await this.startPart();
        }, 2);
    }
    protected async startPart(): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startPart');

        // Trigger the first update manually, so that we will have info on the part before receiving any moves
        // This is useful when we join a part in the middle.
        await this.onCurrentPartUpdate((await this.gameService.getPart(this.currentPartId)).get());

        // We subscribe to the part only at this point.
        // Once we receive the notification that the part started, we will subscribe to the events
        this.partSubscription =
            this.gameService.subscribeToChanges(this.currentPartId, async(part: MGPOptional<Part>) => {
                assert(part.isPresent(), 'OnlineGameWrapper observed a part being deleted, this should not happen');
                await this.onCurrentPartUpdate(part.get());
            });
    }
    private async onCurrentPartUpdate(update: Part, attempt: number = 5): Promise<void> {
        const part: PartDocument = new PartDocument(this.currentPartId, update);
        const updateTypes: UpdateType[] = this.getUpdateTypes(part);
        display(OnlineGameWrapperComponent.VERBOSE, 'UpdateType: ' + updateTypes.map((u: UpdateType) => u.value) + '(' + update.turn + ')');
        const oldPart: PartDocument | null = this.currentPart;
        this.currentPart = part;

        for (const updateType of updateTypes) {
            await this.applyUpdate(updateType, part, oldPart);
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
    private async applyUpdate(updateType: UpdateType, part: PartDocument, oldPart: PartDocument | null): Promise<void> {
        switch (updateType) {
            case UpdateType.DUPLICATE:
                return;
            case UpdateType.END_GAME_WITHOUT_TIME:
                this.currentPart = oldPart;
                return;
            case UpdateType.END_GAME:
                return this.onGameEnd();
            case UpdateType.PRE_START_DOC:
                return;
            default:
                assert(updateType === UpdateType.STARTING_DOC, 'Unexpected update type ' + updateType);
                return this.onGameStart(part);
        }
    }
    private async onGameStart(part: PartDocument): Promise<void> {
        await this.initializePlayersDatas(part);
        const turn: number = this.gameComponent.getTurn();
        assert(turn === 0, 'turn is always 0');


        this.timeManager.onGameStart(this.configRoom);
        // The game has started, we can subscribe to the events to receive moves etc.
        // We don't want to do it sooner, as the clocks need to be started before receiving any move
        // Importantly, we can receive more than one event at a time.
        // This is in particular used to deal with joining a game in the middle:
        // we don't want to apply all clock actions then
        const callback: (events: PartEvent[]) => Promise<void> = async(events: PartEvent[]): Promise<void> => {
            console.log('CALLBACK')
            console.log(events)
            this.beforeEventsBatch();
            for (const event of events) {
                switch (event.eventType) {
                    case 'Move':
                        const moveEvent: PartEventMove = event as PartEventMove;
                        await this.onReceivedMove(moveEvent);
                        break;
                    case 'Request':
                        const requestEvent: PartEventRequest = event as PartEventRequest;
                        this.onReceivedRequest(requestEvent);
                        break;
                    case 'Reply':
                        const replyEvent: PartEventReply = event as PartEventReply;
                        await this.onReceivedReply(replyEvent);
                        break;
                    default:
                        Utils.expectToBe(event.eventType, 'Action', 'Event should be an action');
                        const actionEvent: PartEventAction = event as PartEventAction;
                        this.onReceivedAction(actionEvent);
                        break;
                }
            }
            await this.afterEventsBatch();
        };
        this.eventsSubscription = this.partService.subscribeToEvents(this.currentPartId, callback);
    }
    private async onGameEnd(): Promise<void> {
        await this.observedPartService.removeObservedPart();
        const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
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
        this.timeManager.onGameEnd();
    }
    private async onReceivedMove(moveEvent: PartEventMove): Promise<void> {
        const rules: Rules<Move, GameState, unknown> = this.gameComponent.rules;
        const currentPartTurn: number = this.gameComponent.getTurn();
        const chosenMove: Move = this.gameComponent.encoder.decode(moveEvent.move);
        const legality: MGPFallible<unknown> = rules.isLegal(chosenMove, this.gameComponent.getState());
        const message: string = 'We received an incorrect db move: ' + chosenMove.toString() +
            ' at turn ' + currentPartTurn +
            'because "' + legality.getReasonOr('') + '"';
        assert(legality.isSuccess(), message);
        const success: boolean = rules.choose(chosenMove);
        assert(success, 'Chosen move should be legal after all checks, but it is not!');
        this.gameComponent.updateBoard();
        this.timeManager.onReceivedMove(moveEvent);
    }
    private onReceivedRequest(request: PartEventRequest): void {
        this.lastRequestOrReply = MGPOptional.of(request);
        switch (request.requestType) {
            case 'TakeBack':
                break;
            case 'Rematch':
                this.rematchProposed = true;
                const opponent: Player = Player.of(request.player).getOpponent();
                if (this.isPlayer(opponent)) {
                    this.opponentProposedRematch = true;
                }
                break;
            default:
                Utils.expectToBe(request.requestType, 'Draw', 'Request should be draw');
                break;
        }
    }
    private async onReceivedReply(reply: PartEventReply): Promise<void> {
        this.lastRequestOrReply = MGPOptional.of(reply);
        if (reply.reply === 'Reject') {
            // Nothing to do when a request is rejected
            return;
        }
        switch (reply.requestType) {
            case 'TakeBack':
                const accepter: Player = Player.of(reply.player);
                this.takeBackToPreviousPlayerTurn(accepter.getOpponent());
                break;
            case 'Rematch':
                await this.router.navigate(['/nextGameLoading']);
                const game: string = this.extractGameNameFromURL();
                await this.router.navigate(['/play', game, reply.data]);
                break;
            default:
                Utils.expectToBe(reply.requestType, 'Draw');
                // Nothing to do as the part will be updated with the draw
                break;
        }
    }
    private onReceivedAction(action: PartEventAction): void {
        this.timeManager.onReceivedAction(action);
    }
    private beforeEventsBatch(): void {
        this.timeManager.beforeEventsBatch(this.endGame);
    }
    private async afterEventsBatch(): Promise<void> {
        console.log(this.gameComponent.getTurn())
        const player: Player = Player.fromTurn(this.gameComponent.getTurn());
        console.log(player);
        this.timeManager.afterEventsBatch(this.endGame, player, await this.getServerTime());
    }
    public notifyDraw(scores?: [number, number]): Promise<void> {
        this.endGame = true;
        const player: Player = this.role as Player;
        return this.gameService.updatePart(this.currentPartId, player, scores, true);
    }
    public async notifyTimeoutVictory(victoriousPlayer: MinimalUser,
                                      user: Player,
                                      lastIndex: number,
                                      loser: MinimalUser)
    : Promise<void>
    {
        this.endGame = true;
        await this.gameService.notifyTimeout(this.currentPartId, user, lastIndex, victoriousPlayer, loser);
    }
    public notifyVictory(winner: Player, scores?: [number, number]): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.notifyVictory');

        const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
        const playerZero: MinimalUser = this.players[0].get();
        const playerOne: MinimalUser = this.players[1].get();
        if (winner === Player.ONE) {
            this.currentPart = currentPart.setWinnerAndLoser(playerOne, playerZero);
        } else {
            this.currentPart = currentPart.setWinnerAndLoser(playerZero, playerOne);
        }
        this.endGame = true;
        const player: Player = this.role as Player;

        return this.gameService.updatePart(this.currentPartId,
                                           player,
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
        } else if (this.takeBackHasJustBeenRefusedByOpponent()) {
            return false;
        } else if (this.getTakeBackRequester() === PlayerOrNone.NONE) {
            return true;
        } else {
            return false;
        }
    }
    private takeBackHasJustBeenRefusedByOpponent(): boolean {
        if (this.lastRequestOrReply.isAbsent()) return false;
        const requestOrReply: PartEventRequest | PartEventReply = this.lastRequestOrReply.get();
        return requestOrReply.eventType === 'Reply' &&
               requestOrReply.requestType === 'TakeBack' &&
               requestOrReply.player === (this.role as Player).getOpponent().value &&
               requestOrReply.reply === 'Reject';
    }
    public isOpponentWaitingForTakeBackResponse(): boolean {
        const requester: PlayerOrNone = this.getTakeBackRequester();
        if (requester.isPlayer()) {
            return requester !== this.role;
        } else {
            return false;
        }
    }
    private getTakeBackRequester(): PlayerOrNone {
        if (this.lastRequestOrReply.isAbsent()) return PlayerOrNone.NONE;
        const requestOrReply: PartEventRequest | PartEventReply = this.lastRequestOrReply.get();
        if (requestOrReply.eventType === 'Request' && requestOrReply.requestType === 'TakeBack') {
            return Player.of(requestOrReply.player);
        } else {
            return PlayerOrNone.NONE;
        }
    }
    private takeBackToPreviousPlayerTurn(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.takeBackToPreviousPlayerTurn');
        // Take back once, in any case
        this.gameComponent.rules.node = this.gameComponent.rules.node.mother.get();
        if (this.gameComponent.getCurrentPlayer() !== player) {
            // Take back a second time to make sure it end up on player's turn
            this.gameComponent.rules.node = this.gameComponent.rules.node.mother.get();
        }
        this.currentPlayer = this.players[this.gameComponent.getTurn() % 2].get();
        this.gameComponent.updateBoard();
    }
    public canProposeDraw(): boolean {
        assert(this.isPlaying(), 'Non playing should not call canProposeDraw');
        if (this.endGame) {
            return false;
        } else if (this.drawHasBeenRefusedByOpponent()) {
            return false;
        } else if (this.isOpponentWaitingForDrawResponse()) {
            return false;
        } else if (this.getDrawRequester() === PlayerOrNone.NONE) {
            return true;
        } else {
            return false;
        }
    }
    private drawHasBeenRefusedByOpponent(): boolean {
        if (this.lastRequestOrReply.isAbsent()) return false;
        const requestOrReply: PartEventRequest | PartEventReply = this.lastRequestOrReply.get();
        return requestOrReply.eventType === 'Reply' &&
               requestOrReply.requestType === 'Draw' &&
               requestOrReply.player === (this.role as Player).getOpponent().value &&
               requestOrReply.reply === 'Reject';
    }
    public isOpponentWaitingForDrawResponse(): boolean {
        const drawRequester: PlayerOrNone = this.getDrawRequester();
        if (drawRequester === PlayerOrNone.NONE) return false;
        return drawRequester !== this.role;
    }
    private getDrawRequester(): PlayerOrNone {
        if (this.lastRequestOrReply.isAbsent()) return PlayerOrNone.NONE;
        const requestOrReply: PartEventRequest | PartEventReply = this.lastRequestOrReply.get();
        if (requestOrReply.eventType === 'Request' && requestOrReply.requestType === 'Draw') {
            return Player.of(requestOrReply.player);
        } else {
            return PlayerOrNone.NONE;
        }
    }
    public async initializePlayersDatas(updatedICurrentPart: PartDocument): Promise<void> {
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
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.onLegalUserMove');
        if (this.isOpponentWaitingForTakeBackResponse()) {
            this.gameComponent.message('You must answer to take back request');
        } else {
            // We will update the part with new scores and game status (if needed)
            // We have to compute the game status before adding the move to avoid
            // risking receiving the move before computing the game status (thereby adding twice the same move)
            const legality: MGPFallible<unknown> =
                this.gameComponent.rules.isLegal(move, this.gameComponent.rules.node.gameState);
            assert(legality.isSuccess(), 'onLegalUserMove called with an illegal move');
            const stateAfterMove: GameState =
                this.gameComponent.rules.applyLegalMove(move, this.gameComponent.rules.node.gameState, legality.get());
            const node: MGPNode<Rules<Move, GameState, unknown>, Move, GameState, unknown> =
                new MGPNode(stateAfterMove, MGPOptional.of(this.gameComponent.rules.node), MGPOptional.of(move));
            const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(node);

            // To adhere to security rules, we must add the move before updating the part
            const encodedMove: JSONValueWithoutArray = this.gameComponent.encoder.encodeMove(move);
            await this.gameService.addMove(this.currentPartId, this.role as Player, encodedMove);
            return this.updatePartWithStatusAndScores(gameStatus, scores);
        }
    }
    public async updatePartWithStatusAndScores(gameStatus: GameStatus, scores?: [number, number])
    : Promise<void>
    {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.updatePart(' + scores + ')');
        if (gameStatus.isEndGame) {
            if (gameStatus === GameStatus.DRAW) {
                return this.notifyDraw(scores);
            } else {
                assert(gameStatus.winner.isPlayer(), 'Non-draw end games should have a winner');
                const winner: Player = gameStatus.winner as Player;
                return this.notifyVictory(winner, scores);
            }
        } else {
            const player: Player = this.role as Player;
            return this.gameService.updatePart(this.currentPartId, player, scores);
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
        display(OnlineGameWrapperComponent.VERBOSE || true, 'OnlineGameWrapperComponent.reachedOutOfTime(' + player + ')');
        const lastIndex: number = this.getLastIndex();
        const currentPlayer: Player = this.role as Player;
        if (this.isPlaying() === false) {
            return;
        }
        const opponent: MinimalUser = Utils.getNonNullable(this.opponent);
        if (player === this.role) {
            await this.notifyTimeoutVictory(opponent, currentPlayer, lastIndex, this.authUser.toMinimalUser());
        } else {
            await this.notifyTimeoutVictory(this.authUser.toMinimalUser(), currentPlayer, player.value, opponent);
        }
    }
    public async acceptRematch(): Promise<boolean> {
        assert(this.isPlaying(), 'Non playing should not call acceptRematch');
        const currentPartDocument: PartDocument =
            new PartDocument(this.currentPartId, Utils.getNonNullable(this.currentPart).data);
        await this.gameService.acceptRematch(currentPartDocument, this.role as Player);
        return true;
    }
    public async proposeRematch(): Promise<boolean> {
        assert(this.isPlaying(), 'Non playing should not call proposeRematch');
        await this.gameService.proposeRematch(this.currentPartId, this.role as Player);
        return true;
    }
    public proposeDraw(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call proposeDraw');
        return this.gameService.proposeDraw(this.currentPartId, this.role as Player);
    }
    public acceptDraw(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call acceptDraw');
        return this.gameService.acceptDraw(this.currentPartId, this.getLastIndex(), this.role as Player);
    }
    public refuseDraw(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call refuseDraw');
        return this.gameService.refuseDraw(this.currentPartId, this.role as Player);
    }
    public askTakeBack(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call askTakeBack');
        return this.gameService.askTakeBack(this.currentPartId, this.role as Player);
    }
    public async acceptTakeBack(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call acceptTakeBack');
        const player: Player = this.role as Player;
        await this.gameService.acceptTakeBack(this.currentPartId,
                                              Utils.getNonNullable(this.currentPart),
                                              player);
    }
    public refuseTakeBack(): Promise<void> {
        assert(this.isPlaying(), 'Non playing should not call refuseTakeBack');
        return this.gameService.refuseTakeBack(this.currentPartId, this.role as Player);
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
        return false;
    }
    public canResign(): boolean {
        assert(this.isPlaying(), 'Non playing should not call canResign');
        if (this.endGame === true) {
            return false;
        }
        return this.opponent != null;
    }
    public canProposeRematch(): boolean {
        return this.endGame && this.isPlaying() && this.rematchProposed === false;
    }
    public canAcceptRematch(): boolean {
        return this.endGame && this.isPlaying() && this.rematchProposed && this.opponentProposedRematch;
    }
    public addGlobalTime(): Promise<void> {
        const giver: Player = this.role as Player;
        return this.gameService.addGlobalTime(this.currentPartId, giver);
    }
    public addTurnTime(): Promise<void> {
        const giver: Player = this.role as Player;
        return this.gameService.addTurnTime(this.currentPartId, giver);
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
            this.eventsSubscription.unsubscribe();
        }
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnDestroy finished');
    }
}

/**
 * The time manager manages clocks of each player.
 * There are two main scenarios to consider:
 *   1. we join at the beginning of a game, or
 *   2. we join mid-game.
 * On top of that, it is important to remember that time can be added to a player.
 */
@Injectable({
    providedIn: 'root',
})
export class OGWCTimeManagerService {
    // TODO: wrong chrono is playing in some take backs (when it switches player)

    // The turn clocks of each player
    private turnClocks: [CountDownComponent, CountDownComponent]; // Initialized by setClocks
    // The global clocks of each player
    private globalClocks: [CountDownComponent, CountDownComponent]; // Initialized by setClocks
    // All clocks managed by this time manager
    private allClocks: CountDownComponent[]; // Initialized by setClocks
    /*
     * The configRoom, which is set when starting the clocks.
     * We need it to know the maximal game and move durations.
     */
    private configRoom: MGPOptional<ConfigRoom> = MGPOptional.empty();
    // The global time taken by each player since the beginning of the part
    private readonly takenGlobalTime: [number, number] = [0, 0];
    // The global time added to each player
    private readonly extraGlobalTime: [number, number] = [0, 0];
    // The turn time available for each player. Distinct from the clocks so it stays constant within a turn
    private readonly availableTurnTime: [number, number] = [0, 0];
    // The time at which the current move started
    private lastMoveStartTimestamp: MGPOptional<Timestamp> = MGPOptional.empty();

    public setClocks(turnClocks: [CountDownComponent, CountDownComponent],
                     globalClocks: [CountDownComponent, CountDownComponent])
    : void
    {
        this.turnClocks = turnClocks;
        this.globalClocks = globalClocks;
        this.allClocks = turnClocks.concat(globalClocks);
    }
    // At the beginning of a game, set up clocks and remember when the game started
    public onGameStart(configRoom: ConfigRoom): void {
        console.log('GameStart')
        this.configRoom = MGPOptional.of(configRoom);
        for (const player of Player.PLAYERS) {
            // We need to initialize the service's data
            // Otherwise if we go to another page and come back, the service stays alive and the data is off
            this.takenGlobalTime[player.value] = 0;
            this.extraGlobalTime[player.value] = 0;
            this.availableTurnTime[player.value] = this.getMoveDurationInMs();
            // And we setup the clocks
            this.globalClocks[player.value].setDuration(this.getPartDurationInMs());
            this.turnClocks[player.value].setDuration(this.getMoveDurationInMs());
        }
        console.log('Starting Clocks')
        // We want the clocks to be paused, as we will only activate the required ones
        for (const clock of this.allClocks) {
            clock.start();
            clock.pause();
        }

    }
    private getPartDurationInMs(): number {
        return this.configRoom.get().totalPartDuration * 1000;
    }
    private getMoveDurationInMs(): number {
        return this.configRoom.get().maximalMoveDuration * 1000;
    }
    public onReceivedAction(action: PartEventAction): void {
        console.log('ReceivedAction: ', action.action)
        switch (action.action) {
            case 'AddTurnTime':
                this.addTurnTime(Player.of(action.player));
                break;
            case 'AddGlobalTime':
                this.addGlobalTime(Player.of(action.player));
                break;
            case 'StartGame':
                this.lastMoveStartTimestamp = MGPOptional.of(action.time as Timestamp);
                break;
        }
    }
    public onReceivedMove(move: PartEventMove): void {
        console.log('ReceivedMove from player ' + move.player)
        const player: Player = Player.of(move.player);

        const moveTimestamp: Timestamp = move.time as Timestamp;
        const takenMoveTime: number = this.getMillisecondsElapsedSinceLastMoveStart(moveTimestamp);
        console.log('Got move, updating lastMoveStartTimestamp to ' + showTimestamp(moveTimestamp))
        this.lastMoveStartTimestamp = MGPOptional.of(moveTimestamp);
        this.takenGlobalTime[player.value] += takenMoveTime;

        this.availableTurnTime[player.value] -= takenMoveTime;

        // Now is the time to update the other player's clock
        // They may get updated through later action such as time additions
        const nextPlayer: Player = player.getOpponent();
        this.availableTurnTime[nextPlayer.value] = this.getMoveDurationInMs();
        const nextPlayerAdaptedGlobalTime: number = this.getPartDurationInMs() - this.takenGlobalTime[nextPlayer.value];
        this.globalClocks[nextPlayer.value].changeDuration(nextPlayerAdaptedGlobalTime);
    }
    private getMillisecondsElapsedSinceLastMoveStart(timestamp: Timestamp): number {
        return getMillisecondsElapsed(this.lastMoveStartTimestamp.get(), timestamp);
    }
    // Stops all clocks that are running
    public onGameEnd(): void {
        console.log('GameEnd')
        for (const clock of this.allClocks) {
            // We want to stop the clock, but stop is just pause + change some variables
            // And stop throws if the clock is paused! So we just stop it if it's not paused already
            // We don't care what state the clocks are after calling this function, since the part is finished
            if (clock.isIdle() === false) {
                clock.stop();
            }
        }
    }
    // Pauses all clocks before handling new events
    public beforeEventsBatch(gameEnd: boolean): void {
        console.log('BeforeEventsBatch -> pause clocks')
        if (gameEnd === false) {
            this.pauseAllClocks();
        }
    }
    // Continue the current player clock after receiving events
    public afterEventsBatch(gameEnd: boolean, player: Player, currentTime: Timestamp): void {
        console.log('AfterEventsBatch, player is ' + player)
        if (gameEnd === false) {
            this.updateClocks();
            // The drift is how long has passed since the last event occurred
            // It can be only a few ms, or a much longer time in case we join mid-game
            console.log('actual drift is ' + this.getMillisecondsElapsedSinceLastMoveStart(currentTime) + 'ms')
            // TODO: drift is ok at first turn, not after first move
            const drift: number = this.getMillisecondsElapsedSinceLastMoveStart(currentTime);
            // console.log({drift, current: currentTime.toString(), lastMoveTime: this.lastMoveStartTimestamp.get().toString()})
            // We need to subtract the time to take the drift into account
            this.turnClocks[player.value].subtract(drift);
            this.globalClocks[player.value].subtract(drift);
            this.resumeClocks(player);
        }
    }
    // Resumes the clocks of player. Public for testing purposes only.
    public resumeClocks(player: Player): void {
        console.log('ResumingClocks for player ' + player)
        this.turnClocks[player.value].resume();
        this.globalClocks[player.value].resume();
    }
    // Add turn time to the opponent of a player
    private addTurnTime(player: Player): void {
        const secondsToAdd: number = 30;
        this.availableTurnTime[player.getOpponent().value] += secondsToAdd * 1000;
    }
    // Add time to the global clock of the opponent of a player
    private addGlobalTime(player: Player): void {
        console.log('Adding global time to player ' + player);
        const secondsToAdd: number = 5 * 60;
        this.extraGlobalTime[player.getOpponent().value] += secondsToAdd * 1000;
    }
    // Update clocks with the available time
    private updateClocks(): void {
        console.log('UpdateClocks')
        for (const player of Player.PLAYERS) {
            this.turnClocks[player.value].changeDuration(this.availableTurnTime[player.value]);
            const globalTime: number =
                this.getPartDurationInMs() + this.extraGlobalTime[player.value] - this.takenGlobalTime[player.value];
            this.globalClocks[player.value].changeDuration(globalTime);
        }
    }
    // Pauses all clocks that are running
    private pauseAllClocks(): void {
        console.log('PauseClocks')
        for (const clock of this.allClocks) {
            if (clock.isIdle() === false) {
                clock.pause();
            }
        }
    }
}
