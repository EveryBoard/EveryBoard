import { Component, ComponentRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { Move } from '../../jscaip/Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { GameInfo } from '../normal-component/pick-game/pick-game.component';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Localized } from 'src/app/utils/LocaleUtils';
import { AbstractGameComponent } from '../game-components/game-component/GameComponent';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Comparable } from 'src/app/utils/Comparable';

export class GameWrapperMessages {

    public static readonly NOT_YOUR_TURN: Localized = () => $localize`It is not your turn!`;

    public static readonly GAME_HAS_ENDED: Localized = () => $localize`This game has ended.`;

    public static readonly CANNOT_PLAY_AS_OBSERVER: Localized = () => $localize`You are an observer in this game, you cannot play.`;

    public static readonly MUST_ANSWER_REQUEST: Localized = () => $localize`You must answer your opponent's request.`;

    public static NO_MATCHING_GAME(gameName: string): string {
        return $localize`This game (${gameName}) does not exist.`;
    }

}

@Component({ template: '' })
export abstract class GameWrapper<P extends Comparable> {

    // This holds the #board html element
    @ViewChild('board', { read: ViewContainerRef })
    public boardRef: ViewContainerRef | null = null;

    public gameComponent: AbstractGameComponent;

    public players: MGPOptional<P>[] = [MGPOptional.empty(), MGPOptional.empty()];

    public role: PlayerOrNone = PlayerOrNone.NONE;

    public endGame: boolean = false;

    public Player: typeof Player = Player;

    public constructor(protected readonly actRoute: ActivatedRoute,
                       protected readonly connectedUserService: ConnectedUserService,
                       protected readonly router: Router,
                       protected readonly messageDisplayer: MessageDisplayer)
    {
    }
    public getMatchingComponent(gameName: string): MGPOptional<Type<AbstractGameComponent>> {
        const gameInfo: MGPOptional<GameInfo> =
            MGPOptional.ofNullable(GameInfo.ALL_GAMES().find((gameInfo: GameInfo) => gameInfo.urlName === gameName));
        return gameInfo.map((gameInfo: GameInfo) => gameInfo.component);
    }
    protected async afterViewInit(): Promise<boolean> {
        const gameCreatedSuccessfully: boolean = await this.createGameComponent();
        if (gameCreatedSuccessfully) {
            this.gameComponent.node = this.gameComponent.rules.getInitialNode();
            await this.gameComponent.updateBoard(false);
        }
        return gameCreatedSuccessfully;
    }
    protected getGameName(): string {
        return Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('compo'));
    }
    private async createGameComponent(): Promise<boolean> {
        const gameName: string = this.getGameName();
        const component: MGPOptional<Type<AbstractGameComponent>> = this.getMatchingComponent(gameName);
        if (component.isAbsent()) {
            await this.router.navigate(['/notFound', GameWrapperMessages.NO_MATCHING_GAME(gameName)], { skipLocationChange: true });
            return false;
        }
        assert(this.boardRef != null, 'Board element should be present');

        const componentRef: ComponentRef<AbstractGameComponent> =
            Utils.getNonNullable(this.boardRef).createComponent(component.get());
        this.gameComponent = componentRef.instance;

        // chooseMove is called by the game component when a move is done
        this.gameComponent.chooseMove = (m: Move): Promise<MGPValidation> => {
            // the game wrapper can then act accordingly to the chosen move.
            return this.receiveValidMove(m);
        };
        // canUserPlay is called upon a click by the user
        this.gameComponent.canUserPlay = (elementName: string): Promise<MGPValidation> => {
            return this.canUserPlay(elementName);
        };
        this.gameComponent.isPlayerTurn = (): boolean => {
            return this.isPlayerTurn();
        };
        // Mostly for interception by TutorialGameWrapper
        this.gameComponent.cancelMoveOnWrapper = (reason?: string): Promise<void> => {
            return this.onCancelMove(reason);
        };
        await this.setRole(this.role);
        return true;
    }
    public async setRole(role: PlayerOrNone): Promise<void> {
        this.role = role;
        this.gameComponent.role = this.role;
        if (this.gameComponent.hasAsymmetricBoard) {
            this.gameComponent.rotation = 'rotate(' + (this.role.value * 180) + ')';
        }
        await this.updateBoardAndShowLastMove(false); // Trigger redrawing of the board (might need to be rotated 180°)
    }
    public async receiveValidMove(move: Move): Promise<MGPValidation> {
        const legality: MGPFallible<unknown> = this.gameComponent.rules.isLegal(move, this.gameComponent.getState());
        if (legality.isFailure()) {
            await this.gameComponent.cancelMove(legality.getReason());
            return MGPValidation.ofFallible(legality);
        }
        this.gameComponent.cancelMoveAttempt();
        await this.onLegalUserMove(move);
        return MGPValidation.SUCCESS;
    }
    public abstract onLegalUserMove(move: Move, scores?: [number, number]): Promise<void>;

    public abstract onCancelMove(_reason?: string): Promise<void>;

    public abstract getPlayer(): P;

    public async canUserPlay(_clickedElementName: string): Promise<MGPValidation> {
        if (this.role === PlayerOrNone.NONE) {
            const message: string = GameWrapperMessages.CANNOT_PLAY_AS_OBSERVER();
            return MGPValidation.failure(message);
        }
        if (this.isPlayerTurn() === false) {
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN());
        }
        if (this.endGame) {
            return MGPValidation.failure(GameWrapperMessages.GAME_HAS_ENDED());
        }
        return MGPValidation.SUCCESS;
    }
    public isPlayerTurn(): boolean {
        if (this.role === PlayerOrNone.NONE) {
            return false;
        }
        if (this.gameComponent == null) {
            // This can happen if called before the component has been set up
            return false;
        }
        const turn: number = this.gameComponent.getTurn();
        const indexPlayer: number = turn % 2;
        const player: P = this.getPlayer();
        if (this.players[indexPlayer].isPresent()) {
            return this.players[indexPlayer].equalsValue(player);
        } else {
            return true;
        }
    }
    public getBoardHighlight(): string[] {
        if (this.endGame) {
            return ['endgame-bg'];
        } else if (this.isPlayerTurn()) {
            const turn: number = this.gameComponent.getTurn();
            return ['player' + (turn % 2) + '-bg'];
        } else {
            return [];
        }
    }
    protected async updateBoardAndShowLastMove(triggerAnimation: boolean): Promise<void> {
        this.gameComponent.cancelMoveAttempt();
        this.gameComponent.hideLastMove();
        await this.gameComponent.updateBoard(triggerAnimation);
        if (this.gameComponent.node.move.isPresent()) {
            const move: Move = this.gameComponent.node.move.get();
            await this.gameComponent.showLastMove(move);
        }
    }
}
