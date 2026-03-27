import { NgIf, NgFor, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Signal, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Mutex } from 'async-mutex';
import { Subscription } from 'rxjs';

import { JSONValue, MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ConfigRoom } from '../../../domain/ConfigRoom';
import { Game, GameEvent, GameEventMove, GameEventReply, GameResult, RequestType } from '../../../domain/Game';
import { MinimalUser } from '../../../domain/MinimalUser';
import { AbstractNode, GameNode } from '../../../jscaip/AI/GameNode';
import { GameStatus } from '../../../jscaip/GameStatus';
import { Move } from '../../../jscaip/Move';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { GameState } from '../../../jscaip/state/GameState';
import { ConnectedUserService } from '../../../services/ConnectedUserService';
import { GameService } from '../../../services/GameService';
import { Debug } from '../../../utils/Debug';
import { Localized } from '../../../utils/LocaleUtils';
import { ChatComponent } from '../../normal-component/chat/chat.component';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { TimerComponent } from '../../normal-component/timer/timer.component';
import { ViewConfigComponent } from '../../normal-component/view-config/view-config.component';
import { GameWrapper, GameWrapperMessages } from '../GameWrapper';
import { GameCreationComponent } from '../game-creation/game-creation.component';

import { OGWCRequestManagerService, RequestInfo } from './OGWCRequestManagerService';
import { OGWCTimeManagerService } from './OGWCTimeManagerService';


export class OnlineGameWrapperMessages {

    public static readonly CANNOT_PLAY_AS_OBSERVER: Localized = () => $localize`You are an observer in this game, you cannot play.`;

    public static readonly MUST_ANSWER_REQUEST: Localized = () => $localize`You must answer your opponent's request.`;
}

@Component({
    selector: 'app-online-game-wrapper',
    templateUrl: './online-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [OGWCTimeManagerService, OGWCRequestManagerService],
    imports: [NgIf, GameCreationComponent, ViewConfigComponent, TimerComponent, NgFor,
        FaIconComponent, RouterLink, NgClass, ChatComponent],
})
@Debug.log
export class OnlineGameWrapperComponent extends GameWrapper<MinimalUser> implements OnInit, OnDestroy {

    private readonly connectedUserService: ConnectedUserService = inject(ConnectedUserService);
    private readonly gameService: GameService = inject(GameService);
    private readonly timeManager: OGWCTimeManagerService = inject(OGWCTimeManagerService);
    private readonly requestManager: OGWCRequestManagerService = inject(OGWCRequestManagerService);
    private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);


    public readonly timerZeroGame: Signal<TimerComponent | undefined> = viewChild<TimerComponent>('timerZeroGame');
    public readonly timerOneGame: Signal<TimerComponent | undefined> = viewChild<TimerComponent>('timerOneGame');
    public readonly timerZeroMove: Signal<TimerComponent | undefined> = viewChild<TimerComponent>('timerZeroMove');
    public readonly timerOneMove: Signal<TimerComponent | undefined> = viewChild<TimerComponent>('timerOneMove');

    public game: Game | null = null;
    public gameId!: string; // Initialized in ngOnInit
    public gameStarted: boolean = false;
    private opponent: MinimalUser | null = null;
    public currentUser: MinimalUser | null = null;

    private isSynced: boolean = false;

    public configRoom: ConfigRoom;

    private gameSubscription: Subscription = new Subscription();

    public readonly OFFLINE_FONT_COLOR: { [key: string]: string } = { color: 'lightgrey' };

    public readonly gameTimeMessage: string = $localize`05:00`;
    public readonly moveTimeMessage: string = $localize`00:30`;

    public readonly requestInfos: Record<RequestType, RequestInfo> = OGWCRequestManagerService.requestInfos;
    public readonly allRequests: RequestType[] = ['TakeBack', 'Draw', 'Rematch'];

    private moveSentButNotReceivedYet: boolean = false;

    public viewConfig: boolean = false;

    private extractGameIdFromURL(): string {
        return Utils.getNonNullable(this.activatedRoute.snapshot.paramMap.get('id'));
    }

    public isPlaying(): boolean {
        return this.isSynced && this.role.isPlayer();
    }

    public override getPlayer(): MinimalUser {
        return this.connectedUserService.user.get().toMinimalUser();
    }

    private async redirectIfGameDoesNotExist(): Promise<void> {
        const urlName: string = this.getGameUrlName();
        const gameExists: boolean = GameInfo.getByUrlName(urlName).isPresent();
        if (gameExists === false) {
            const message: string = GameWrapperMessages.NO_MATCHING_GAME(urlName);
            await this.router.navigate(['/notFound', message], { skipLocationChange: true } );
        }
    }

    private setGameIdOrRedirect(): Promise<void> {
        this.gameId = this.extractGameIdFromURL();
        return this.redirectIfGameDoesNotExist();
    }

    public async ngOnInit(): Promise<void> {
        await this.setGameIdOrRedirect();
    }

    public async startGame(configRoom: ConfigRoom): Promise<void> {
        Utils.assert(this.gameStarted === false, 'Should not start already started game');
        this.configRoom = configRoom;
        this.gameStarted = true;

        setTimeout(async() => {
            // the small waiting is there to make sure that the timers are loaded by view
            const createdSuccessfully: boolean = await this.createMatchingGameComponent();
            this.timeManager.setTimers([this.timerZeroMove()!, this.timerOneMove()!],
                                       [this.timerZeroGame()!, this.timerOneGame()!]);
            Utils.assert(createdSuccessfully, 'Game should be created successfully, otherwise game-creation would have redirected');
            Utils.assert(this.gameComponent !== null, 'Game component should exist');
            this.gameComponent.config = MGPOptional.of(configRoom.rulesConfig);
            await this.subscribeToGameUpdates();
        }, 2);
    }

    private async subscribeToGameUpdates(): Promise<void> {
        // This mutex will ensure that we receive one update/event at a time.
        // Without it, it could be the case that async operations are scheduled at the wrong time
        const mutex: Mutex = new Mutex();
        const onGameUpdate: (game: Game) => Promise<void> =
            (game: Game) => {
                return mutex.runExclusive(async() => {
                    await this.onGameUpdate(game);
                });
            };
        const onGameEvent: (event: GameEvent, serverTime: number) => Promise<void> =
            (event: GameEvent, serverTime: number) => {
                return mutex.runExclusive(async() => {
                    await this.onGameEvent(event, serverTime);
                });
            };
        this.gameSubscription =
            await this.gameService.subscribeTo(
                this.gameId,
                onGameUpdate,
                onGameEvent,
                (error: string): void => this.onError(error),
            );
    }

    private onError(reason: string): void {
        // We don't expect any error to come up during a game, but if one does, we'll show it
        this.messageDisplayer.criticalMessage($localize`Unexpected error from backend: ${reason}`);
    }

    private async onGameUpdate(game: Game): Promise<void> {
        this.game = game;
        this.cdr.detectChanges();
    }

    private async onGameStart(): Promise<void> {
        const turn: number = this.gameComponent.getTurn();
        Utils.assert(turn === 0, 'turn should always be 0 upon game start');
        await this.initializePlayersData();
        this.timeManager.onGameStart(this.configRoom, Utils.getNonNullable(this.game), this.players);
        this.requestManager.onGameStart();
    }

    private async onGameEvent(event: GameEvent, serverTime: number): Promise<void> {
        this.timeManager.beforeEvent();
        switch (event.eventType) {
            case 'Move':
                await this.onReceivedMove(event);
                break;
            case 'Request':
                this.requestManager.onReceivedRequest(event);
                break;
            case 'Reply':
                const mustHandle: boolean = await this.requestManager.onReceivedReply(event);
                if (mustHandle) {
                    await this.handleReply(event);
                }
                break;
            default:
                Utils.expectToBe(event.eventType, 'Action', 'Event should be an action');
                if (event.action === 'StartGame') await this.onGameStart();
                if (event.action === 'EndGame') await this.onGameEnd();
                if (event.action === 'Sync') this.isSynced = true;
                this.timeManager.onReceivedAction(event);
                break;
        }
        this.timeManager.afterEvent(Player.ofTurn(this.gameComponent.getTurn()), serverTime);
        this.cdr.detectChanges();
    }

    private async handleReply(reply: GameEventReply): Promise<void> {
        switch (reply.requestType) {
            case 'TakeBack':
                const accepter: Player = this.timeManager.playerOfMinimalUser(reply.user);
                await this.takeBackToPreviousPlayerTurn(accepter.getOpponent());
                break;
            case 'Rematch':
                await this.router.navigate(['/nextGameLoading']);
                const urlName: string = this.getGameUrlName();
                await this.router.navigate(['/play', urlName, reply.data]);
                break;
            case 'Draw':
                // Nothing to do as the part will be updated with the draw
                break;
        }
    }

    private async onGameEnd(): Promise<void> {
        await this.setInteractive(false);
        this.endGame = true;
        this.cdr.detectChanges();
    }

    private async onReceivedMove(moveEvent: GameEventMove): Promise<void> {
        if (this.moveSentButNotReceivedYet) {
            // This is our move, we have already shown it
            // So we do nothing to show it again.
            this.moveSentButNotReceivedYet = false;
        } else {
            // This is not our move, it is either the move of the opponent, one older move, or we are observing.
            // In any case, we have to show it. We also animate it if we are synced.
            const move: Move = this.gameComponent.encoder.decode(moveEvent.move);
            await this.applyMove(move, this.isSynced);
        }
        // Need to handle the rest irrespective of which move we received
        await this.setCurrentPlayerAccordingToCurrentTurn();
        this.timeManager.onReceivedMove(moveEvent);
        this.requestManager.onReceivedMove();
    }

    public getTurn(): number {
        return this.gameComponent.getTurn();
    }

    private async setCurrentPlayerAccordingToCurrentTurn(): Promise<void> {
        this.currentUser = this.players[this.getTurn() % 2].get();
        await this.setInteractive(
            this.currentUser.name === this.getPlayer().name,
            false,
        );
    }

    private async takeBackToPreviousPlayerTurn(player: Player): Promise<void> {
        // Take back once, in any case
        this.gameComponent.node = this.gameComponent.node.parent.get();
        if (this.gameComponent.getCurrentPlayer() !== player) {
            Utils.assert(this.gameComponent.getTurn() > 0, 'Should not allow player that never moved to take back');
            // Take back a second time to make sure it end up on player's turn
            this.gameComponent.node = this.gameComponent.node.parent.get();
        }
        await this.setCurrentPlayerAccordingToCurrentTurn();
        const triggerAnimation: boolean = this.gameComponent.getTurn() === 0;
        await this.showCurrentState(triggerAnimation);
    }

    public canResign(): boolean {
        Utils.assert(this.isPlaying(), 'Non playing should not call canResign');
        if (this.endGame) {
            return false;
        }
        const hasOpponent: boolean = this.opponent != null;
        return hasOpponent;
    }

    public requestAvailable(request: RequestType): boolean {
        switch (request) {
            case 'TakeBack':
                return this.canAskTakeBack();
            case 'Draw':
                return this.canProposeDraw();
            default:
                Utils.expectToBe(request, 'Rematch');
                return this.canProposeRematch();
        }
    }

    public mustReply(): boolean {
        return this.getRequestAwaitingReplyFromUs().isPresent();
    }

    public getRequestAwaitingReplyFromUs(): MGPOptional<RequestType> {
        Utils.assert(this.role.isPlayer(), 'User should be playing');
        return this.requestManager.getUnrespondedRequestFrom(Utils.getNonNullable(this.opponent));
    }

    public getRequestAwaitingReplyFromOpponent(): MGPOptional<RequestType> {
        Utils.assert(this.role.isPlayer(), 'User should be playing');
        return this.requestManager.getUnrespondedRequestFrom(Utils.getNonNullable(this.currentUser));
    }

    public deniedRequest(): MGPOptional<RequestType> {
        return this.requestManager.deniedRequest();
    }

    public canPass(): boolean {
        Utils.assert(this.isPlaying(), 'Non playing should not call canPass');
        if (this.endGame) return false;
        if (this.currentUser?.name !== this.getPlayer().name) return false;
        return this.gameComponent.canPass;
    }

    private canAskTakeBack(): boolean {
        Utils.assert(this.isPlaying(), 'Non playing should not call canAskTakeBack');
        Utils.assert(this.game != null, 'should not call canAskTakeBack when game is not defined yet');
        // Cannot do a request in end game
        if (this.endGame) return false;
        // Cannot do a take back request before we played
        if (this.gameComponent.getTurn() <= this.role.getValue()) return false;
        // Otherwise, it depends on the request manager
        return this.requestManager.canMakeRequest('TakeBack');
    }

    private canProposeDraw(): boolean {
        Utils.assert(this.isPlaying(), 'Non playing should not call canProposeDraw');
        // Cannot propose draw in end game
        if (this.endGame) return false;
        // Otherwise, it depends on the request manager
        return this.requestManager.canMakeRequest('Draw');
    }

    private canProposeRematch(): boolean {
        return this.endGame && this.requestManager.canMakeRequest('Rematch');
    }

    public override async canUserPlay(clickedElementName: string): Promise<MGPValidation> {
        if (this.role.isNone()) {
            const message: string = OnlineGameWrapperMessages.CANNOT_PLAY_AS_OBSERVER();
            return MGPValidation.failure(message);
        }
        const result: MGPValidation = await super.canUserPlay(clickedElementName);
        if (result.isFailure()) {
            return result; // NOT_YOUR_TURN or GAME_HAS_ENDED are checked here
        } else if (this.mustReply()) {
            return MGPValidation.failure(OnlineGameWrapperMessages.MUST_ANSWER_REQUEST());
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    private async initializePlayersData(): Promise<void> {
        const game: Game = Utils.getNonNullable(this.game);
        this.players = [
            MGPOptional.of(game.playerZero),
            MGPOptional.ofNullable(game.playerOne),
        ];
        await this.setCurrentPlayerAccordingToCurrentTurn();
        await this.setRealObserverRole();
    }

    private async setRealObserverRole(): Promise<void> {
        if (this.players[0].equalsValue(this.getPlayer())) {
            await this.setRole(Player.ZERO);
            this.opponent = this.players[1].get();
        } else if (this.players[1].equalsValue(this.getPlayer())) {
            await this.setRole(Player.ONE);
            this.opponent = this.players[0].get();
        } else {
            await this.setRole(PlayerOrNone.NONE);
        }
    }

    public async onLegalUserMove(move: Move): Promise<void> {
        // First, show the move in the component
        await this.applyMove(move, false); // Move was already animated by its game component, no need to animate again
        // Then, send the move
        const config: MGPOptional<RulesConfig> = this.getConfig();
        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.node, config);
        const encodedMove: JSONValue = this.gameComponent.encoder.encode(move);
        this.moveSentButNotReceivedYet = true;
        await this.gameService.addMove(encodedMove);
        if (gameStatus.isEndGame) {
            await this.gameService.endGame(gameStatus.winner);
        }
    }

    private async applyMove(move: Move, triggerAnimation: boolean): Promise<void> {
        const oldNode: AbstractNode = this.gameComponent.node;
        const state: GameState = oldNode.gameState;
        const config: MGPOptional<RulesConfig> = this.getConfig();
        const legality: MGPFallible<unknown> = this.gameComponent.rules.isLegal(move, state, config);
        Utils.assert(legality.isSuccess(), 'OGWC.applyMove called with an illegal move');
        const stateAfterMove: GameState = this.gameComponent.rules.applyLegalMove(move, state, config, legality.get());
        this.gameComponent.node = new GameNode(stateAfterMove, MGPOptional.of(oldNode), MGPOptional.of(move));
        await this.showNewMove(triggerAnimation);
    }

    // Called by the resign button
    public async resign(): Promise<void> {
        await this.gameService.resign();
    }

    // Called by the clocks
    public async reachedOutOfTime(player: Player): Promise<void> {
        if (this.isPlaying() === false) {
            return;
        }
        await this.gameService.notifyTimeout(player);
    }

    // Called by the corresponding button
    public async propose(request: RequestType): Promise<void> {
        Utils.assert(this.role.isPlayer(), 'cannot propose request if not player');
        switch (request) {
            case 'Rematch':
                return this.gameService.proposeRematch();
            case 'Draw':
                return this.gameService.proposeDraw();
            default:
                Utils.expectToBe(request, 'TakeBack');
                return this.gameService.askTakeBack();
        }
    }

    // Called by the 'accept' button
    public async accept(): Promise<void> {
        Utils.assert(this.role.isPlayer(), 'cannot accept request if not player');
        const request: RequestType = this.requestManager.getCurrentRequest().get().requestType;
        switch (request) {
            case 'Rematch':
                return this.gameService.acceptRematch();
            case 'Draw':
                return this.gameService.acceptDraw();
            default:
                Utils.expectToBe(request, 'TakeBack');
                return this.gameService.acceptTakeBack();
        }
    }

    // Called by the 'reject' button
    public async reject(): Promise<void> {
        Utils.assert(this.role.isPlayer(), 'cannot reject request if not player');
        const request: RequestType = this.requestManager.getCurrentRequest().get().requestType;
        switch (request) {
            case 'Rematch':
                return this.gameService.rejectRematch();
            case 'Draw':
                return this.gameService.rejectDraw();
            default:
                Utils.expectToBe(request, 'TakeBack');
                return this.gameService.rejectTakeBack();
        }
    }

    // Called by the 'AddGameTime' button
    public addGameTime(): Promise<void> {
        return this.gameService.addGameTime();
    }

    // Called by the 'AddMoveTime' button
    public addMoveTime(): Promise<void> {
        return this.gameService.addMoveTime();
    }

    public override async onCancelMove(reason?: string): Promise<void> {
        await super.onCancelMove(reason);
        if (this.gameComponent.node.previousMove.isPresent()) {
            const move: Move = this.gameComponent.node.previousMove.get();
            await this.gameComponent.showLastMove(move);
        }
        this.cdr.detectChanges();
    }

    public async ngOnDestroy(): Promise<void> {
        this.gameSubscription.unsubscribe();
    }

    public override getConfig(): MGPOptional<RulesConfig> {
        const rulesConfig: RulesConfig = this.configRoom.rulesConfig;
        return MGPOptional.of(rulesConfig);
    }


    public isAgreedDraw(): boolean {
        const result: GameResult = Utils.getNonNullable(this.game).result;
        return result === 'AgreedDrawByZero' || result === 'AgreedDrawByOne';
    }

    public getDrawAccepter(): MinimalUser {
        const result: GameResult = Utils.getNonNullable(this.game).result;
        switch (result) {
            case 'AgreedDrawByZero':
                return Utils.getNonNullable(this.game).playerZero;
            default:
                Utils.expectToBe(result, 'AgreedDrawByOne');
                return Utils.getNonNullable(this.game).playerOne;
        }
    }

    public isWin(): boolean {
        const result: GameResult = Utils.getNonNullable(this.game).result;
        return result === 'VictoryOfZero' || result === 'VictoryOfOne';
    }

    public isTimeout(): boolean {
        const result: GameResult = Utils.getNonNullable(this.game).result;
        return result === 'TimeoutOfZero' || result === 'TimeoutOfOne';
    }

    public isResign(): boolean {
        const result: GameResult = Utils.getNonNullable(this.game).result;
        return result === 'ResignOfZero' || result === 'ResignOfOne';
    }

    public getWinner(): MinimalUser {
        const result: GameResult = Utils.getNonNullable(this.game).result;
        switch (result) {
            case 'VictoryOfOne':
            case 'TimeoutOfZero':
            case 'ResignOfZero':
                return Utils.getNonNullable(this.game).playerOne;
            default:
                Utils.expectToBeMultiple(result, ['VictoryOfZero', 'TimeoutOfOne', 'ResignOfOne']);
                return Utils.getNonNullable(this.game).playerZero;
        }
    }

    public getLoser(): MinimalUser {
        const result: GameResult = Utils.getNonNullable(this.game).result;
        switch (result) {
            case 'VictoryOfOne':
            case 'TimeoutOfZero':
            case 'ResignOfZero':
                return Utils.getNonNullable(this.game).playerZero;
            default:
                Utils.expectToBeMultiple(result, ['VictoryOfZero', 'TimeoutOfOne', 'ResignOfOne']);
                return Utils.getNonNullable(this.game).playerOne;
        }
    }
}
