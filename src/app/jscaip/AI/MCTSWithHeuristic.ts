import { Utils } from '@everyboard/lib';

import { GameStatus } from '../GameStatus';
import { Move } from '../Move';
import { Player } from '../Player';
import { SuperRules } from '../Rules';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { MoveGenerator } from './AI';
import { BoardValue } from './BoardValue';
import { GameNode } from './GameNode';
import { HeuristicBounds, HeuristicWithBounds } from './Heuristic';
import { MCTS } from './MCTS';

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
                       private readonly heuristic: HeuristicWithBounds<M, S, B, C>)
    {
        super(name, moveGenerator, rules);
    }

    /**
     * Return a score which is the average of all metrics
     */
    protected override score(node: GameNode<M, S>,
                             config: C,
                             gameStatus: GameStatus,
                             player: Player)
    : number
    {
        if (gameStatus === GameStatus.ONGOING) {
            const boardValue: B = this.heuristic.getBoardValue(node, config);
            const bounds: HeuristicBounds<B> = this.heuristic.getBounds(config);
            Utils.assert(boardValue.metrics.length === bounds.player0Best.metrics.length &&
                         boardValue.metrics.length === bounds.player1Best.metrics.length,
                         `MCTSWithHeuristic ${this.name}: metrics and bound values should have the same shape`);
            let value: number = 0;
            for (let i: number = 0; i < boardValue.metrics.length; i++) {
                const player0Best: number = bounds.player0Best.metrics[i];
                const metric: number = boardValue.metrics[i];
                const player1Best: number = bounds.player1Best.metrics[i];
                // It can be the case sometimes that the metric is out of range from the bounds.
                // In such cases, we treat this as an extreme value, and cap it to the best available value
                const isOutOfBounds: boolean = metric < player0Best || player1Best < metric;
                const isPreVictory: boolean = BoardValue.isPreVictoryValue(metric);
                if (isOutOfBounds && (isPreVictory === false)) {
                    // Our metric is outside of the bounds!
                    // We can warn the user about it. (except for pre-victories)
                    console.warn(`MCTSWithHeuristic ${this.name} got a value outside its bounds: ${metric} is outside of [${player0Best}, ${player1Best}]`);
                }
                const boundedMetric: number = Math.max(player0Best, Math.min(metric, player1Best));
                const denom: number = player1Best - player0Best;
                if (denom === 0) {
                    value += 0.5; // neutral for this metric
                } else {
                    // the fraction added will always be in [0,1]
                    value += (boundedMetric - player0Best) / denom;
                }
            }
            value = value / boardValue.metrics.length;
            Utils.assert(0 <= value && value <= 1, `MCTSWithHeuristic ${this.name} got a value outside of [0,1]`);
            if (player === Player.ONE) {
                return value;
            } else {
                return 1 - value;
            }
        } else {
            return super.score(node, config, gameStatus, player);
        }
    }
}
