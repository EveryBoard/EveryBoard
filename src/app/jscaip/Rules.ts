import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Move } from './Move';
import { Type } from '@angular/core';
import { Debug } from '../utils/utils';
import { assert } from 'src/app/utils/assert';
import { GameState } from './GameState';
import { MGPOptional } from '../utils/MGPOptional';
import { MGPFallible } from '../utils/MGPFallible';
import { BoardValue } from './BoardValue';
import { GameStatus } from './GameStatus';
import { GameConfig } from './ConfigUtil';


export abstract class Rules<M extends Move,
                            S extends GameState,
                            C extends GameConfig = GameConfig,
                            L = void,
                            B extends BoardValue = BoardValue>
{

    public constructor(public readonly stateType: Type<S>,
                       public config: C)
    {
        if (this.stateType.toString().substring(0, 17) === 'class TablutState' && Object.keys(config).length === 0) {
            console.log('TABLUT CRÉER SANS CONFIG')
            throw new Error('SODBET, Tafl crée sans config !!')
        }
    }
    /* The data that represent the status of the game at the current moment, including:
     * the board
     * the turn
     * the extra data that might be score of each player
     * the remaining pawn that you can put on the board...
     */

    public choose(node: MGPNode<Rules<M, S, C, L, B>, M, S, C, L, B>, move: M)
    : MGPOptional<MGPNode<Rules<M, S, C, L, B>, M, S, C, L, B>>
    {
        /* used by the rules to update board
         * return true if the move was legal, and the node updated
         * return false otherwise
         */
        Debug.display('Rules', 'choose', move.toString() + ' was proposed');
        const legality: MGPFallible<L> = this.isLegal(move, node.gameState);
        if (node.hasMoves()) { // if calculation has already been done by the AI
            Debug.display('Rules', 'choose', 'current node has moves');
            const choice: MGPOptional<MGPNode<Rules<M, S, C, L, B>, M, S, C, L, B>> = node.getSonByMove(move);
            // let's not create the node twice
            if (choice.isPresent()) {
                assert(legality.isSuccess(), 'Rules.choose: Move is illegal: ' + legality.getReasonOr(''));
                Debug.display('Rules', 'choose', 'and this proposed move is found in the list, so it is legal');
                return MGPOptional.of(choice.get());
            }
        }
        Debug.display('Rules', 'choose', `current node has no moves or is pruned, let's verify ourselves`);
        if (legality.isFailure()) {
            Debug.display('Rules', 'choose', 'Move is illegal: ' + legality.getReason());
            return MGPOptional.empty();
        } else {
            Debug.display('Rules', 'choose', `Move is legal, let's apply it`);
        }

        const resultingState: GameState = this.applyLegalMove(move, node.gameState, legality.get());
        const son: MGPNode<Rules<M, S, C, L, B>, M, S, C, L, B> = new MGPNode(resultingState as S,
                                                                              MGPOptional.of(node),
                                                                              MGPOptional.of(move));
        return MGPOptional.of(son);
    }
    /**
     * Applies a legal move, given the precomputed information `info`
     */
    public abstract applyLegalMove(move: M, state: S, info: L): S;
    /**
     * Returns success if the move is legal, with some potentially precomputed data.
     * If the move is illegal, returns a failure with information on why it is illegal
     */
    public abstract isLegal(move: M, state: S): MGPFallible<L>;

    public getInitialNode(config?: C): MGPNode<Rules<M, S, C, L, B>, M, S, C, L, B> {
        if (config != null && Object.keys(config).length > 0) {
            this.config = config;
        }
        // eslint-disable-next-line dot-notation
        const initialState: S = this.stateType['getInitialState'](config);
        return new MGPNode(initialState);
    }
    public abstract getGameStatus(node: MGPNode<Rules<M, S, C, L>, M, S, C, L>): GameStatus;
}

export abstract class AbstractRules extends Rules<Move, GameState, GameConfig, unknown> {
}
