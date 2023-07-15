import { Component, ComponentRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { Move } from '../../jscaip/Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { GameInfo } from '../normal-component/pick-game/pick-game.component';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Localized } from 'src/app/utils/LocaleUtils';
import { AbstractGameComponent } from '../game-components/game-component/GameComponent';
import { GameState } from 'src/app/jscaip/GameState';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Comparable, comparableEquals } from 'src/app/utils/Comparable';

export class GameWrapperMessages {

    public static readonly NOT_YOUR_TURN: Localized = () => $localize`It is not your turn!`;

    public static readonly NO_CLONING_FEATURE: Localized = () => $localize`You cannot clone a game. This feature might be implemented later.`;

    public static NO_MATCHING_GAME(gameName: string): string {
        return $localize`This game (${gameName}) does not exist.`;
    }

}

@Component({ template: '' })
export abstract class GameWrapper<P extends Comparable> {

    public static VERBOSE: boolean = false;

    // This holds the #board html element
    @ViewChild('board', { read: ViewContainerRef })
    public boardRef: ViewContainerRef | null = null;

    public gameComponent: AbstractGameComponent;

    public players: MGPOptional<P>[] = [MGPOptional.empty(), MGPOptional.empty()];

    public role: PlayerOrNone = PlayerOrNone.NONE;

    public canPass: boolean;

    public endGame: boolean = false;

    public Player: typeof Player = Player;

    public constructor(protected readonly actRoute: ActivatedRoute,
                       protected readonly connectedUserService: ConnectedUserService,
                       protected readonly router: Router,
                       protected readonly messageDisplayer: MessageDisplayer)
    {
        display(GameWrapper.VERBOSE, 'GameWrapper.constructed: ' + (this.boardRef != null));
    }
    public getMatchingComponent(gameName: string): MGPOptional<Type<AbstractGameComponent>> {
        display(GameWrapper.VERBOSE, 'GameWrapper.getMatchingComponent');
        const gameInfo: MGPOptional<GameInfo> =
            MGPOptional.ofNullable(GameInfo.ALL_GAMES().find((gameInfo: GameInfo) => gameInfo.urlName === gameName));
        return gameInfo.map((gameInfo: GameInfo) => gameInfo.component);
    }
    protected async afterViewInit(): Promise<boolean> {
        display(GameWrapper.VERBOSE, 'GameWrapper.afterViewInit');
        const gameCreatedSuccessfully: boolean = await this.createGameComponent();
        if (gameCreatedSuccessfully) {
            this.gameComponent.node = this.gameComponent.rules.getInitialNode();
            await this.gameComponent.updateBoard(false, 'GW.afterViewInit');
        }
        return gameCreatedSuccessfully;
    }
    protected getGameName(): string {
        return Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('compo'));
    }
    private async createGameComponent(): Promise<boolean> {
        display(GameWrapper.VERBOSE, { m: 'GameWrapper.createGameComponent', that: this });

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

        this.gameComponent.chooseMove = // so that when the game component do a move
            (m: Move, s: GameState, scores?: [number, number]): Promise<MGPValidation> => {
                return this.receiveValidMove(m, s, scores);
            };
        // the game wrapper can then act accordingly to the chosen move.
        this.gameComponent.canUserPlay =
            // So that when the game component click
            (elementName: string): Promise<MGPValidation> => {
                return this.onUserClick(elementName);
            };
        // the game wrapper can act accordly
        this.gameComponent.isPlayerTurn = (): boolean => {
            return this.isPlayerTurn();
        };
        this.gameComponent.cancelMoveOnWrapper =
            // Mostly for interception by TutorialGameWrapper
            (reason?: string): Promise<void> => {
                return this.onCancelMove(reason);
            };
        await this.setRole(this.role);
        this.canPass = this.gameComponent.canPass;
        return true;
    }
    public async setRole(role: PlayerOrNone): Promise<void> {
        this.role = role;
        this.gameComponent.role = this.role;
        if (this.gameComponent.hasAsymmetricBoard) {
            this.gameComponent.rotation = 'rotate(' + (this.role.value * 180) + ')';
        }
        await this.updateBoardAndShowLastMove(); // Trigger redrawing of the board (might need to be rotated 180°)
    }
    public async receiveValidMove(move: Move,
                                  state: GameState,
                                  scores?: [number, number])
    : Promise<MGPValidation>
    {
        const LOCAL_VERBOSE: boolean = false;
        display(GameWrapper.VERBOSE || LOCAL_VERBOSE,
                { gameWrapper_receiveValidMove_AKA_chooseMove: { move, state, scores } });
        if (this.isPlayerTurn() === false) {
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN());
        }
        if (this.endGame) {
            return MGPValidation.failure($localize`The game has ended.`);
        }
        const legality: MGPFallible<unknown> = this.gameComponent.rules.isLegal(move, state);
        if (legality.isFailure()) {
            await this.gameComponent.cancelMove(legality.getReason());
            return MGPValidation.ofFallible(legality);
        }
        this.gameComponent.cancelMoveAttempt();
        await this.onLegalUserMove(move, scores);
        display(GameWrapper.VERBOSE || LOCAL_VERBOSE, 'GameWrapper.receiveValidMove says: valid move legal');
        return MGPValidation.SUCCESS;
    }
    public abstract onLegalUserMove(move: Move, scores?: [number, number]): Promise<void>;

    public async onUserClick(_elementName: string): Promise<MGPValidation> {
        if (this.role === PlayerOrNone.NONE) {
            const message: string = GameWrapperMessages.NO_CLONING_FEATURE();
            return MGPValidation.failure(message);
        }
        if (this.isPlayerTurn()) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN());
        }
    }
    public abstract onCancelMove(_reason?: string): Promise<void>;

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
        display(GameWrapper.VERBOSE, { isPlayerTurn: {
            turn,
            players: this.players,
            player,
            observer: this.role,
            areYouPlayer: this.players[indexPlayer].isPresent() &&
                comparableEquals(this.players[indexPlayer].get(), player),
            isThereAPlayer: this.players[indexPlayer],
        } });
        if (this.players[indexPlayer].isPresent()) {
            return this.players[indexPlayer].equalsValue(player);
        } else {
            return true;
        }
    }
    public abstract getPlayer(): P

    public getBoardHighlight(): string[] {
        if (this.endGame) {
            return ['endgame-bg'];
        }
        if (this.isPlayerTurn()) {
            const turn: number = this.gameComponent.getTurn();
            return ['player' + (turn % 2) + '-bg'];
        }
        return [];
    }
    protected async updateBoardAndShowLastMove(triggerAnimation: boolean=false): Promise<void> {
        await this.gameComponent.updateBoard(triggerAnimation, 'GW.updateBoardAndShowLastMove');
        if (this.gameComponent.node.move.isPresent()) {
            const move: Move = this.gameComponent.node.move.get();
            await this.gameComponent.showLastMove(move);
        }
    }
}
