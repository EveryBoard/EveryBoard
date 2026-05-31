import { Utils } from '@everyboard/lib';

import { Move } from '../Move';
import { SuperRules } from '../Rules';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { AIDepthLimitOptions, MoveGenerator } from './AI';
import { AbstractMinimax, MinimaxHash } from './AbstractMinimax';
import { BoardValue } from './BoardValue';
import { GameNode } from './GameNode';
import { Heuristic } from './Heuristic';

export class Minimax<M extends Move,
                     S extends GameState,
                     C extends RulesConfig = EmptyRulesConfig,
                     L = void>
    extends AbstractMinimax<M, S, AIDepthLimitOptions, C, L> {

    public constructor(name: string,
                       rules: SuperRules<M, S, C, L>,
                       heuristic: Heuristic<M, S, BoardValue, C>,
                       moveGenerator: MoveGenerator<M, S, C>,
                       hash?: MinimaxHash<S>) {
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
