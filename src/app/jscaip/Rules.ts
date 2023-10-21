import { GameNode } from 'src/app/jscaip/GameNode';
import { Move } from './Move';
import { Type } from '@angular/core';
import { Debug, Utils } from '../utils/utils';
import { GameState } from './GameState';
import { MGPOptional } from '../utils/MGPOptional';
import { MGPFallible } from '../utils/MGPFallible';
import { GameStatus } from './GameStatus';
import { RulesConfig } from './RulesConfigUtil';
import { RulesConfigDescription } from '../components/wrapper-components/rules-configuration/RulesConfigDescription';

export abstract class Rules<M extends Move,
                            S extends GameState,
                            C extends RulesConfig = RulesConfig,
                            L = void>
{

    public constructor(public readonly stateType: Type<S>,
                       public config: C)
    {
    }

    /* The data that represent the status of the game at the current moment, including:
     * the board
     * the turn
     * the extra data that might be score of each player
     * the remaining pawn that you can put on the board...
     */

    public choose(node: GameNode<M, S>, move: M) : MGPFallible<GameNode<M, S>> {
        /* used by the rules to update board
         * return true if the move was legal, and the node updated
         * return false otherwise
         */
        Debug.display('Rules', 'choose', move.toString() + ' was proposed');
        const legality: MGPFallible<L> = this.isLegal(move, node.gameState);
        if (legality.isFailure()) {
            Debug.display('Rules', 'choose', 'Move is illegal: ' + legality.getReason());
            return MGPFallible.failure(legality.getReason());
        }
        const choice: MGPOptional<GameNode<M, S>> = node.getChild(move);
        if (choice.isPresent()) {
            // The node is already in the tree, let's not create it twice
            Utils.assert(legality.isSuccess(), 'Rules.choose: Move is illegal: ' + legality.getReasonOr(''));
            Debug.display('Rules', 'choose', 'and this proposed move is found in the list, so it is legal');
            return MGPFallible.success(choice.get());
        }
        const resultingState: GameState = this.applyLegalMove(move, node.gameState, legality.get());
        const child: GameNode<M, S> = new GameNode(resultingState as S, MGPOptional.of(node), MGPOptional.of(move));
        return MGPFallible.success(child);
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

    public getInitialNode(config?: C): GameNode<M, S> {
        if (config != null) {
            this.config = config;
        }
        // eslint-disable-next-line dot-notation
        const initialState: S = this.stateType['getInitialState'](config);
        return new GameNode(initialState);
    }

    public getRulesConfigDescription(): RulesConfigDescription<C> {
        return RulesConfigDescription.DEFAULT as RulesConfigDescription<C>;
    }

    public abstract getGameStatus(node: GameNode<M, S>): GameStatus;
}

export abstract class AbstractRules extends Rules<Move, GameState, RulesConfig, unknown> {
}
