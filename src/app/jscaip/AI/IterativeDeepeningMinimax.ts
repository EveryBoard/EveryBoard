import { MGPOptional, Utils } from '@everyboard/lib';

import { Move } from '../Move';
import { SuperRules } from '../Rules';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { AITimeLimitOptions, MoveGenerator } from './AI';
import { AbstractMinimax, MinimaxHash, SearchResult } from './AbstractMinimax';
import { BoardValue } from './BoardValue';
import { GameNode } from './GameNode';
import { Heuristic } from './Heuristic';

export class IterativeDeepeningMinimax<M extends Move,
                                       S extends GameState,
                                       C extends RulesConfig = EmptyRulesConfig,
                                       L = void>
    extends AbstractMinimax<M, S, AITimeLimitOptions, C, L> {

    public constructor(name: string,
                       rules: SuperRules<M, S, C, L>,
                       heuristic: Heuristic<M, S, BoardValue, C>,
                       moveGenerator: MoveGenerator<M, S, C>,
                       hash?: MinimaxHash<S>) {
        super(name, rules, heuristic, moveGenerator, hash);
        for (let i: number = 1; i < 10; i++) {
            this.availableOptions.push({ name: `${i*i} seconds`, maxSeconds: i*i });
        }
    }

    public doChooseNextMove(node: GameNode<M, S>, options: AITimeLimitOptions, config: C): M {
        Utils.assert(this.rules.getGameStatus(node, config).isEndGame === false,
                     'Minimax has been asked to choose a move from a finished game');
        const boardValue: BoardValue = this.getExpectedExtremum(node, config);

        const start: number = Date.now();
        const endTime: number = Date.now() + options.maxSeconds * 1000;
        this.endSearchBy = MGPOptional.of(endTime);
        let currentDepth: number = 1;
        let achievedDepth: number = 1; // only for logging
        let bestMove: MGPOptional<M> = MGPOptional.empty();
        while (Date.now() < endTime) {
            const candidateOptional: MGPOptional<SearchResult<M>> =
                this.alphaBeta(node, currentDepth, boardValue.toMinimum(), boardValue.toMaximum(), config);
            if (candidateOptional.isAbsent()) {
                // Search finished, no need to explore further
                break;
            }
            const candidate: SearchResult<M> = candidateOptional.get();
            if (candidate.complete && Date.now() < this.endSearchBy.get()) {
                bestMove = MGPOptional.of(candidate.move);
                achievedDepth = currentDepth;
            }
            currentDepth++;
        }
        Utils.assert(bestMove.isPresent(), 'best move should have been computed');
        console.log('achieved depth: ' + achievedDepth + ' in ' + (Date.now() - start) + 'ms');

        this.endSearchBy = MGPOptional.empty();
        return bestMove.get();
    }
}
