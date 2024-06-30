import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { Move } from './Move';
import { MGPFallible, MGPOptional, Utils } from '@everyboard/lib';
import { GameState } from './state/GameState';
import { GameStatus } from './GameStatus';
import { EmptyRulesConfig, RulesConfig } from './RulesConfigUtil';
import { RulesConfigDescription } from '../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { Debug } from '../utils/Debug';

export abstract class SuperRules<M extends Move,
                                 S extends GameState,
                                 C extends RulesConfig,
                                 L = void>
{

    protected constructor() {}

    /* The data that represent the status of the game at the current moment, including:
     * the board
     * the turn
     * the extra data that might be score of each player
     * the remaining piece that you can put on the board...
     */

    public choose(node: GameNode<M, S>, move: M, config: MGPOptional<C>) : MGPFallible<GameNode<M, S>> {
        /**
         * used by the rules to update board
         * return true if the move was legal, and the node updated
         * return false otherwise
         */
        Debug.display('Rules', 'choose', move.toString() + ' was proposed');
        const legality: MGPFallible<L> = this.isLegal(move, node.gameState, config);
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
        const resultingState: S = this.applyLegalMove(move, node.gameState, config, legality.get());
        const child: GameNode<M, S> = new GameNode(resultingState,
                                                   MGPOptional.of(node),
                                                   MGPOptional.of(move));
        return MGPFallible.success(child);
    }

    /**
     * Applies a legal move, given the precomputed information `info`
     */
    public abstract applyLegalMove(move: M, state: S, config: MGPOptional<C>, info: L): S;

    /**
     * Returns success if the move is legal, with some potentially precomputed data.
     * If the move is illegal, returns a failure with information on why it is illegal
     */
    public abstract isLegal(move: M, state: S, config: MGPOptional<C>): MGPFallible<L>;

    public abstract getInitialState(config: MGPOptional<C>): S;

    public getInitialNode(config: MGPOptional<C>): GameNode<M, S> {
        const initialState: S = this.getInitialState(config);
        return new GameNode(initialState);
    }

    public abstract getRulesConfigDescription(): MGPOptional<RulesConfigDescription<C>>;

    public getDefaultRulesConfig(): MGPOptional<C> {
        const rulesConfigDescription: MGPOptional<RulesConfigDescription<C>> = this.getRulesConfigDescription();
        if (rulesConfigDescription.isPresent()) {
            return MGPOptional.of(rulesConfigDescription.get().getDefaultConfig().config);
        } else {
            return MGPOptional.empty();
        }
    }

    public abstract getGameStatus(node: GameNode<M, S>, config: MGPOptional<C>): GameStatus;
}

export abstract class ConfigurableRules<M extends Move,
                                        S extends GameState,
                                        C extends RulesConfig,
                                        L = void>
    extends SuperRules<M, S, C, L>
{
}

export abstract class Rules<M extends Move,
                            S extends GameState,
                            L = void>
    extends SuperRules<M, S, EmptyRulesConfig, L>
{

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription> {
        return MGPOptional.empty();
    }

}

export abstract class AbstractRules extends SuperRules<Move, GameState, RulesConfig, unknown> {
}
