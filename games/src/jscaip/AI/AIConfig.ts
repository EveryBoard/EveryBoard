import { RulesConfig } from '../../config/RulesConfig';
import { Move } from '../Move';
import { GameState } from '../state/GameState';

import { MoveGenerator } from './AI';
import { BoardValue } from './BoardValue';
import { Heuristic, HeuristicWithBounds } from './Heuristic';

export type MinimaxConfig<M extends Move,
                          S extends GameState,
                          C extends RulesConfig> = {
    readonly id: string;
    readonly name: string;
    readonly heuristic: () => Heuristic<M, S, BoardValue, C>;
    readonly moveGenerator: () => MoveGenerator<M, S, C>;
    readonly useRandomness?: boolean;
    readonly prune?: boolean;
    readonly useTranspositionTables?: boolean;
    readonly hash?: (state: S) => string;
}

export type MCTSConfig<M extends Move, S extends GameState, C extends RulesConfig> = {
    readonly id: string;
    readonly name: string;
    readonly moveGenerator: () => MoveGenerator<M, S, C>;
    readonly heuristic?: () => HeuristicWithBounds<M, S, BoardValue, C>;
}

export type AIConfig<M extends Move, S extends GameState, C extends RulesConfig> = {
    readonly minimax: MinimaxConfig<M, S, C>[];
    readonly mcts: MCTSConfig<M, S, C>[];
}

export const NoAIConfig: AIConfig<Move, GameState, RulesConfig> = {
    minimax: [],
    mcts: [],
};
