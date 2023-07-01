import { Mutex } from 'async-mutex';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { GameService } from 'src/app/services/GameService';
import { UserService } from 'src/app/services/UserService';
import { Move } from '../../../jscaip/Move';
import { Part, PartDocument, GameEvent, GameEventMove, GameEventRequest, GameEventReply, GameEventAction } from '../../../domain/Part';
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
import { Rules } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameState } from 'src/app/jscaip/GameState';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { ObservedPartService } from 'src/app/services/ObservedPartService';
import { GameEventService } from 'src/app/services/GameEventService';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Timestamp } from 'firebase/firestore';
import { OGWCTimeManagerService } from './OGWCTimeManagerService';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { AbstractNode } from 'src/app/jscaip/MGPNode';

export class OnlineGameWrapperMessages {

    public static readonly NO_MATCHING_PART: Localized = () => $localize`The game you tried to join does not exist.`;
}


@Component({
    selector: 'app-online-game-wrapper',
    templateUrl: './online-game-wrapper.component.html',
})
export class OnlineGameWrapperComponent extends GameWrapper<MinimalUser> implements OnInit, OnDestroy {

    public static override VERBOSE: boolean = false;

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

    private lastRequestOrReply: MGPOptional<GameEventRequest | GameEventReply> = MGPOptional.empty();

    public configRoom: ConfigRoom;
    public observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();

    private routerEventsSubscription!: Subscription; // Initialized in ngOnInit
    private userSubscription!: Subscription; // Initialized in ngOnInit
    private opponentSubscription: Subscription = new Subscription();
    private partSubscription: Subscription = new Subscription();
    private gameEventsSubscription: Subscription = new Subscription();
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
                       private readonly gameEventService: GameEventService,
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
            const callback: (user: MGPOptional<User>) => void = (user: MGPOptional<User>): void => {
                if (user.get().lastUpdateTime == null) {
                    // We know that the update has been sent when we actually see a null here
                    updateSent = true;
                } else if (updateSent) {
                    subscription.unsubscribe();
                    resolve(user.get().lastUpdateTime as Timestamp);
                }
            };
            const subscription: Subscription = this.userService.observeUser(userId, callback);
            void this.userService.updatePresenceToken(userId);
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
        const part: Part = (await this.gameService.getPart(this.currentPartId)).get();
        this.currentPart = new PartDocument(this.currentPartId, part);

        // We subscribe to the part only at this point.
        // Once we receive the notification that the part started, we will subscribe to the events
        this.partSubscription =
            this.gameService.subscribeToChanges(this.currentPartId, async(part: MGPOptional<Part>) => {
                assert(part.isPresent(), 'OnlineGameWrapper observed a part being deleted, this should not happen');
                this.currentPart = new PartDocument(this.currentPartId, part.get());
            });
        this.subscribeToEvents();
    }
    private async onGameStart(): Promise<void> {
        await this.initializePlayersDatas(this.currentPart as PartDocument);
        const turn: number = this.gameComponent.getTurn();
        assert(turn === 0, 'turn should always be 0 upon game start');
        this.timeManager.onGameStart(this.configRoom);
    }
    private subscribeToEvents(): void {
        // The game has started, we can subscribe to the events to receive moves etc.
        // We don't want to do it sooner, as the clocks need to be started before receiving any move
        // Importantly, we can receive more than one event at a time.
        // This is in particular used to deal with joining a game in the middle:
        // we don't want to apply all clock actions then
        const mutex: Mutex = new Mutex(); // Need to ensure we receive events one at a time
        const callback: (events: GameEvent[]) => Promise<void> = async(events: GameEvent[]): Promise<void> => {
            await mutex.runExclusive(async() => {
                this.beforeEventsBatch();
                for (const event of events) {
                    switch (event.eventType) {
                        case 'Move':
                            const moveEvent: GameEventMove = event as GameEventMove;
                            await this.onReceivedMove(moveEvent);
                            break;
                        case 'Request':
                            const requestEvent: GameEventRequest = event as GameEventRequest;
                            this.onReceivedRequest(requestEvent);
                            break;
                        case 'Reply':
                            const replyEvent: GameEventReply = event as GameEventReply;
                            await this.onReceivedReply(replyEvent);
                            break;
                        default:
                            Utils.expectToBe(event.eventType, 'Action', 'Event should be an action');
                            const actionEvent: GameEventAction = event as GameEventAction;
                            this.timeManager.onReceivedAction(actionEvent);

                            if (actionEvent.action === 'EndGame') await this.onGameEnd();
                            else if (actionEvent.action === 'StartGame') await this.onGameStart();
                            break;
                    }
                }
                await this.afterEventsBatch();
            });
        };
        this.gameEventsSubscription = this.gameEventService.subscribeToEvents(this.currentPartId, callback);
    }
    private async onGameEnd(): Promise<void> {
        await this.observedPartService.removeObservedPart();
        this.endGame = true;
    }
    private async onReceivedMove(moveEvent: GameEventMove): Promise<void> {
        const rules: Rules<Move, GameState, unknown> = this.gameComponent.rules;
        const currentPartTurn: number = this.gameComponent.getTurn();
        const chosenMove: Move = this.gameComponent.encoder.decode(moveEvent.move);
        const legality: MGPFallible<unknown> = rules.isLegal(chosenMove, this.gameComponent.getState());
        const message: string = 'We received an incorrect db move: ' + chosenMove.toString() +
            ' at turn ' + currentPartTurn +
            'because "' + legality.getReasonOr('') + '"';
        assert(legality.isSuccess(), message);
        const success: MGPOptional<AbstractNode> = rules.choose(this.gameComponent.node, chosenMove);
        assert(success.isPresent(), 'Chosen move should be legal after all checks, but it is not!');
        this.gameComponent.node = success.get();
        this.updateBoardAndShowLastMove();
        this.currentPlayer = this.players[this.gameComponent.getTurn() % 2].get();
        this.timeManager.onReceivedMove(moveEvent);
    }
    private onReceivedRequest(request: GameEventRequest): void {
        this.lastRequestOrReply = MGPOptional.of(request);
        switch (request.requestType) {
            case 'TakeBack':
                // We don't do anything here at the moment.
                // This is because the component checks take backs in getTakeBackRequester
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
    private async onReceivedReply(reply: GameEventReply): Promise<void> {
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
    private beforeEventsBatch(): void {
        this.timeManager.beforeEventsBatch(this.endGame);
    }
    private async afterEventsBatch(): Promise<void> {
        const player: Player = Player.fromTurn(this.gameComponent.getTurn());
        this.timeManager.afterEventsBatch(this.endGame, player, await this.getServerTime());
    }
    public async notifyDraw(scores: MGPOptional<readonly [number, number]>): Promise<void> {
        const player: Player = this.role as Player;
        await this.gameService.drawPart(this.currentPartId, player, scores);
    }
    public async notifyTimeoutVictory(victoriousPlayer: MinimalUser, loser: MinimalUser): Promise<void> {
        const player: Player = this.role as Player;
        await this.gameService.notifyTimeout(this.currentPartId, player, victoriousPlayer, loser);
    }
    public async notifyVictory(winner: Player, scores: MGPOptional<readonly [number, number]>): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.notifyVictory');
        const currentPart: PartDocument = Utils.getNonNullable(this.currentPart);
        const playerZero: MinimalUser = this.players[0].get();
        const playerOne: MinimalUser = this.players[1].get();
        if (winner === Player.ONE) {
            this.currentPart = currentPart.setWinnerAndLoser(playerOne, playerZero);
        } else {
            this.currentPart = currentPart.setWinnerAndLoser(playerZero, playerOne);
        }
        const player: Player = this.role as Player;

        await this.gameService.endPartWithVictory(this.currentPartId,
                                                  player,
                                                  this.currentPart.getWinner().get(),
                                                  this.currentPart.getLoser().get(),
                                                  scores);
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
        const requestOrReply: GameEventRequest | GameEventReply = this.lastRequestOrReply.get();
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
        const requestOrReply: GameEventRequest | GameEventReply = this.lastRequestOrReply.get();
        if (requestOrReply.eventType === 'Request' && requestOrReply.requestType === 'TakeBack') {
            return Player.of(requestOrReply.player);
        } else {
            return PlayerOrNone.NONE;
        }
    }
    private takeBackToPreviousPlayerTurn(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.takeBackToPreviousPlayerTurn');
        // Take back once, in any case
        this.gameComponent.node = this.gameComponent.node.mother.get();
        if (this.gameComponent.getCurrentPlayer() !== player) {
            // Take back a second time to make sure it end up on player's turn
            this.gameComponent.node = this.gameComponent.node.mother.get();
        }
        this.currentPlayer = this.players[this.gameComponent.getTurn() % 2].get();
        this.updateBoardAndShowLastMove();
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
        const requestOrReply: GameEventRequest | GameEventReply = this.lastRequestOrReply.get();
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
        const requestOrReply: GameEventRequest | GameEventReply = this.lastRequestOrReply.get();
        if (requestOrReply.eventType === 'Request' && requestOrReply.requestType === 'Draw') {
            return Player.of(requestOrReply.player);
        } else {
            return PlayerOrNone.NONE;
        }
    }
    public async initializePlayersDatas(part: PartDocument): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, { OnlineGameWrapper_initializePlayersDatas: part });
        this.players = [
            MGPOptional.of(part.data.playerZero),
            MGPOptional.ofNullable(part.data.playerOne),
        ];
        assert(part.data.playerOne != null, 'should not initializePlayersDatas when players data is not received');
        this.currentPlayer = this.players[part.data.turn % 2].get();
        const opponent: MGPOptional<MinimalUser> = await this.setRealObserverRole();
        if (opponent.isPresent()) {
            const callback: (user: MGPOptional<User>) => void = (user: MGPOptional<User>) => {
                assert(user.isPresent(), 'opponent was deleted, what sorcery is this');
                this.opponent = opponent.get();
            };
            this.opponentSubscription = this.userService.observeUser(opponent.get().id, callback);
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
    public async onLegalUserMove(move: Move): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.onLegalUserMove');
        if (this.isOpponentWaitingForTakeBackResponse()) {
            this.gameComponent.message('You must answer to take back request');
        } else {
            // We will update the part with new scores and game status (if needed)
            // We have to compute the game status before adding the move to avoid
            // risking receiving the move before computing the game status (thereby adding twice the same move)
            const legality: MGPFallible<unknown> =
                this.gameComponent.rules.isLegal(move, this.gameComponent.node.gameState);
            assert(legality.isSuccess(), 'onLegalUserMove called with an illegal move');
            const stateAfterMove: GameState =
                this.gameComponent.rules.applyLegalMove(move, this.gameComponent.node.gameState, legality.get());
            const node: MGPNode<Rules<Move, GameState, unknown>, Move, GameState, unknown> =
                new MGPNode(stateAfterMove, MGPOptional.of(this.gameComponent.node), MGPOptional.of(move));
            const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(node);

            // To adhere to security rules, we must add the move before updating the part
            const encodedMove: JSONValueWithoutArray = this.gameComponent.encoder.encodeMove(move);
            await this.gameService.addMove(this.currentPartId, this.role as Player, encodedMove);
            return this.updatePartWithStatusAndScores(gameStatus, this.gameComponent.scores);
        }
    }
    private async updatePartWithStatusAndScores(gameStatus: GameStatus, scores: MGPOptional<readonly [number, number]>)
    : Promise<void>
    {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.updatePartWithStatusAndScores');
        if (gameStatus.isEndGame) {
            if (gameStatus === GameStatus.DRAW) {
                return this.notifyDraw(scores);
            } else {
                assert(gameStatus.winner.isPlayer(), 'Non-draw end games should have a winner');
                const winner: Player = gameStatus.winner as Player;
                return this.notifyVictory(winner, scores);
            }
        } else {
            return this.gameService.updatePart(this.currentPartId, scores);
        }
    }
    public async resign(): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.resign');
        const player: Player = this.role as Player;
        const resigner: MinimalUser = this.getPlayer();
        const victoriousOpponent: MinimalUser = this.players[(this.role.value + 1) % 2].get();
        await this.gameService.resign(this.currentPartId, player, victoriousOpponent, resigner);
    }
    public async reachedOutOfTime(player: Player): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.reachedOutOfTime(' + player + ')');
        if (this.isPlaying() === false) {
            return;
        }
        const opponent: MinimalUser = Utils.getNonNullable(this.opponent);
        if (player === this.role) {
            await this.notifyTimeoutVictory(opponent, this.authUser.toMinimalUser());
        } else {
            await this.notifyTimeoutVictory(this.authUser.toMinimalUser(), opponent);
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
        return this.gameService.acceptDraw(this.currentPartId, this.role as Player);
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
                                              Utils.getNonNullable(this.currentPart).data,
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
        if (this.gameComponent.node.move.isPresent()) {
            const move: Move = this.gameComponent.node.move.get();
            this.gameComponent.showLastMove(move);
        }
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
            this.gameEventsSubscription.unsubscribe();
        }
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnDestroy finished');
    }
}
