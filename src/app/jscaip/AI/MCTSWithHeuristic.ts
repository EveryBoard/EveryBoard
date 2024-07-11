import { MGPOptional, Utils } from '@everyboard/lib';
import { GameStatus } from '../GameStatus';
import { Move } from '../Move';
import { Player } from '../Player';
import { SuperRules } from '../Rules';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';
import { MoveGenerator } from './AI';
import { BoardValue } from './BoardValue';
import { GameNode } from './GameNode';
import { MCTS } from './MCTS';
import { Heuristic } from './Minimax';

/**
 * Like MCTS, but uses a heuristic function to evaluate non-terminated states.
 */
export class MCTSWithHeuristic<M extends Move,
                               S extends GameState,
                               C extends RulesConfig = EmptyRulesConfig,
                               B extends BoardValue = BoardValue,
                               L = void>
    extends MCTS<M, S, C, L>
{

    public constructor(name: string,
                       moveGenerator: MoveGenerator<M, S, C>,
                       rules: SuperRules<M, S, C, L>,
                       private readonly heuristic: Heuristic<M, S, B, C>)
    {
        super(name, moveGenerator, rules);
        // this.maxGameLength = 10; // no need to go further since we have a heuristic
    }

    /**
     * Return a win score which is the average of all metrics
     */
    protected override winScore(node: GameNode<M, S>,
                                config: MGPOptional<C>,
                                gameStatus: GameStatus,
                                player: Player): number {
        if (gameStatus === GameStatus.ONGOING) {
            const boardValue: B = this.heuristic.getBoardValue(node, config);
            const optionalBounds: MGPOptional<{min: B, max: B}> = this.heuristic.getBounds(config);
            Utils.assert(optionalBounds.isPresent(),
                         'MCTSWithHeuristic used with a heuristic that has no max value, please define getMaxValue');
            const bounds: {min: B, max: B} = optionalBounds.get();
            Utils.assert(boardValue.metrics.length === bounds.min.metrics.length &&
                         boardValue.metrics.length === bounds.max.metrics.length,
                         'Metrics and bound values should have the same shape');
            let value: number = 0;
            for (let i: number = 0; i < boardValue.metrics.length; i++) {
                Utils.assert(bounds.min.metrics[i] <= boardValue.metrics[i] &&
                             boardValue.metrics[i] <= bounds.max.metrics[i],
                             'MCTS got a metric outside of its bounds!');
                value += (boardValue.metrics[i] - bounds.min.metrics[i]) /
                    (bounds.max.metrics[i] - bounds.min.metrics[i]);
            }
            value = value / boardValue.metrics.length;
            Utils.assert(0 <= value && value <= 1, 'MCTSWithHeuristic got a value outside of [0,1]');
            return value;
        } else {
            return super.winScore(node, config, gameStatus, player);
        }
    }
}
