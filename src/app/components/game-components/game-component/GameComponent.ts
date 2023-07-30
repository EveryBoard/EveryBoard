import { Move } from '../../../jscaip/Move';
import { Rules } from '../../../jscaip/Rules';
import { Component } from '@angular/core';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TutorialStep } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';
import { GameState } from 'src/app/jscaip/GameState';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { AI, AIOptions, GameNode } from 'src/app/jscaip/MGPNode';
import { BoardValue } from 'src/app/jscaip/BoardValue';

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
export abstract class GameComponent<R extends Rules<M, S, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L = void>
    extends BaseGameComponent
{
    public encoder: MoveEncoder<M>;

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

    public canUserPlay: (element: string) => MGPValidation;

    public cancelMoveOnWrapper: (reason?: string) => void;

    public role: PlayerOrNone;

    /* all game rules should be able to call the game-wrapper
     * the aim is that the game-wrapper will take care of manage what follow
     * ie: - if it's online, he'll tell the game-component when the remote opponent has played
     *     - if it's offline, he'll tell the game-component what the bot have done
     */

    public constructor(public readonly messageDisplayer: MessageDisplayer) {
        super();
    }
    public message(msg: string): void {
        this.messageDisplayer.gameMessage(msg);
    }
    public cancelMove(reason?: string): MGPValidation {
        this.cancelMoveAttempt();
        this.cancelMoveOnWrapper(reason);
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
    public abstract updateBoard(): void;

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
    public getState(): S {
        return this.node.gameState;
    }
    public getPreviousState(): S {
        return this.node.parent.get().gameState;
    }
    public showLastMove(move: M): void {
        // Not needed by default
    }
}

export abstract class AbstractGameComponent extends GameComponent<Rules<Move, GameState, unknown>,
                                                                  Move,
                                                                  GameState,
                                                                  unknown>
{
}
