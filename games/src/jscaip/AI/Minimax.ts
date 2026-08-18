import { Utils } from '@everyboard/lib';

import { Move } from '../Move';
import { Player } from '../Player';
import { PlayerNumberTable } from '../PlayerNumberTable';
import { SuperRules } from '../Rules';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { AIDepthLimitOptions, MoveGenerator } from './AI';
import { AbstractMinimax, MinimaxHashFunction } from './AbstractMinimax';
import { BoardValue } from './BoardValue';
import { GameNode } from './GameNode';
import { Heuristic, HeuristicWithBounds } from './Heuristic';

export abstract class PlayerMetricHeuristicWithBounds<M extends Move,
                                                      S extends GameState,
                                                      C extends RulesConfig = EmptyRulesConfig>
    extends HeuristicWithBounds<M, S, BoardValue, C>
{
    public abstract getMetrics(node: GameNode<M, S>, config: C): PlayerNumberTable;

    // Yes, this is duplicated from PlayerMetricHeuristic, because we don't have multiple inheritance
    // and probably don't want to use mixins!
    public getBoardValue(node: GameNode<M, S>, config: C): BoardValue {
        const metrics: PlayerNumberTable = this.getMetrics(node, config);
        return BoardValue.ofMultiple(
            metrics.get(Player.ZERO).get(),
            metrics.get(Player.ONE).get(),
        );
    }

}

/**
 * This implements the minimax algorithm with alpha-beta pruning.
 */
export class Minimax<M extends Move,
                     S extends GameState,
                     C extends RulesConfig = EmptyRulesConfig,
                     L = void>
    extends AbstractMinimax<M, S, AIDepthLimitOptions, C, L> {

    public constructor(name: string,
                       rules: SuperRules<M, S, C, L>,
                       heuristic: Heuristic<M, S, BoardValue, C>,
                       moveGenerator: MoveGenerator<M, S, C>,
                       hash?: MinimaxHashFunction<S>) {
        super(name, rules, heuristic, moveGenerator, hash);
        for (let i: number = 1; i < 10; i++) {
            this.availableOptions.push({ name: `Level ${i}`, maxDepth: i });
        }
    }

    public doChooseNextMove(node: GameNode<M, S>, options: AIDepthLimitOptions, config: C): M {
        Utils.assert(this.rules.getGameStatus(node, config).isEndGame === false,
                     'Minimax has been asked to choose a move from a finished game');
        const boardValue: BoardValue = this.getExpectedExtremum(node, config);
        return this.alphaBeta(node,
                              options.maxDepth,
                              boardValue.toMinimum(),
                              boardValue.toMaximum(),
                              config).get().move;
    }
}
