import { Move } from '../../../jscaip/Move';
import { Rules } from '../../../jscaip/Rules';
import { Component } from '@angular/core';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Encoder } from 'src/app/utils/Encoder';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TutorialStep } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';
import { GameState } from 'src/app/jscaip/GameState';
import { Debug, Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { GameNode } from 'src/app/jscaip/GameNode';
import { AI, AIOptions } from 'src/app/jscaip/AI';
import { Coord } from 'src/app/jscaip/Coord';

/**
 * Define some methods that are useful to have in game components.
 * We can't define these in GameComponent itself, as they are required
 * by sub components which themselves are not GameComponent subclasses
 */
export abstract class BaseGameComponent {
    // Make ArrayUtils available in game components
    public ArrayUtils: typeof ArrayUtils = ArrayUtils;

    /**
     * Gets the CSS class for a player color
     */
    public getPlayerClass(player: PlayerOrNone): string {
        switch (player) {
            case Player.ZERO: return 'player0-fill';
            case Player.ONE: return 'player1-fill';
            default:
                Utils.expectToBe(player, PlayerOrNone.NONE);
                return '';
        }
    }
}

/**
 * All method are to be implemented by the "final" GameComponent classes
 * Except chooseMove which must be set by the GameWrapper
 * (since OnlineGameWrapper and LocalGameWrapper will not give the same action to do when a move is done)
 */
@Component({
    template: '',
    styleUrls: ['./game-component.scss'],
})
@Debug.log
export abstract class GameComponent<R extends Rules<M, S, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L = void>
    extends BaseGameComponent
{
    public encoder: Encoder<M>;

    public Player: typeof Player = Player;

    public SPACE_SIZE: number = 100;

    public readonly STROKE_WIDTH: number = 8;

    public readonly SMALL_STROKE_WIDTH: number = 2;

    public rules: R;

    public node: GameNode<M, S>;

    public availableAIs: AI<M, S, AIOptions>[];

    public canPass: boolean = false;

    public scores: MGPOptional<readonly [number, number]> = MGPOptional.empty();

    public imagesLocation: string = 'assets/images/';

    public hasAsymmetricBoard: boolean = false;

    // Will contain, once the wrapper change the userRole, the valid orientation (180° when you play Player.ONE)
    public rotation: string = '';

    public tutorial: TutorialStep[];

    public isPlayerTurn: () => boolean;

    public chooseMove: (move: M) => Promise<MGPValidation>;

    public canUserPlay: (element: string) => Promise<MGPValidation>;

    public cancelMoveOnWrapper: (reason?: string) => void;

    // This is where the player is seeing the board from.
    private pointOfView: Player = Player.ZERO;

    // This is true when the view is interactive, e.g., to display clickable pieces
    protected isInteractive: boolean = false;

    public constructor(public readonly messageDisplayer: MessageDisplayer) {
        super();
    }
    public getPointOfView(): Player {
        return this.pointOfView;
    }
    public setPointOfView(pointOfView: Player): void {
        this.pointOfView = pointOfView;
        if (this.hasAsymmetricBoard) {
            this.rotation = 'rotate(' + (pointOfView.value * 180) + ')';
        }
    }
    public setInteractive(interactive: boolean): void {
        this.isInteractive = interactive;
    }
    public message(msg: string): void {
        this.messageDisplayer.gameMessage(msg);
    }
    public async cancelMove(reason?: string): Promise<MGPValidation> {
        this.cancelMoveAttempt();
        this.cancelMoveOnWrapper(reason);
        if (this.node.previousMove.isPresent()) {
            await this.showLastMove(this.node.previousMove.get());
        }
        if (reason == null) {
            return MGPValidation.SUCCESS;
        } else {
            this.messageDisplayer.gameMessage(reason);
            return MGPValidation.failure(reason);
        }
    }
    public cancelMoveAttempt(): void {
        // Override if need be
    }
    public abstract updateBoard(triggerAnimation: boolean): Promise<void>;

    public async pass(): Promise<MGPValidation> {
        const gameName: string = this.constructor.name;
        const error: string = `pass() called on a game that does not redefine it`;
        return ErrorLoggerService.logError('GameComponent', error, { gameName });
    }
    public getTurn(): number {
        return this.node.gameState.turn;
    }
    public getCurrentPlayer(): Player {
        return this.node.gameState.getCurrentPlayer();
    }
    public getCurrentOpponent(): Player {
        return this.node.gameState.getCurrentOpponent();
    }
    public getState(): S {
        return this.node.gameState;
    }
    public getPreviousState(): S {
        return this.node.parent.get().gameState;
    }
    public async showLastMove(move: M): Promise<void> {
        // Not needed by default
        return;
    }
    public hideLastMove(): void {
        // Not needed by default
        return;
    }

    /**
     * Gives the translation transform for coordinate x, y, based on SPACE_SIZE
     */
    public getTranslation(coord: Coord): string {
        return this.getTranslationXY(coord.x, coord.y);
    }
    public getTranslationXY(x: number, y: number): string {
        return `translate(${x * this.SPACE_SIZE} ${y * this.SPACE_SIZE})`;
    }
}

export abstract class AbstractGameComponent extends GameComponent<Rules<Move, GameState, unknown>,
                                                                  Move,
                                                                  GameState,
                                                                  unknown>
{
}
