import { Move } from '../Move';
import { RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { MoveGenerator } from './AI';
import { BoardValue } from './BoardValue';
import { Heuristic } from './Heuristic';

export type MinimaxConfig<M extends Move,
                          S extends GameState,
                          C extends RulesConfig> = {
    readonly id: string,
    readonly name: string,
    // TODO: why is heuristic optional? dummy?
    readonly heuristic?: () => Heuristic<M, S, BoardValue, C>,
    // TODO: why is move generator optional? what if it's not provided? And why is it not optional in MCTSConfig?
    readonly moveGenerator?: () => MoveGenerator<M, S, C>,
    readonly useRandomness?: boolean,
    readonly prune?: boolean,
    readonly useTranspositionTables?: boolean,
    readonly hash?: (state: S) => string,
}

export type MCTSConfig<M extends Move, S extends GameState, C extends RulesConfig> = {
    readonly id: string,
    readonly name: string,
    readonly moveGenerator: () => MoveGenerator<M, S, C>,
    // TODO: use it
    readonly heuristic?: () => Heuristic<M, S, BoardValue, C>,
}

export type AIConfig<M extends Move, S extends GameState, C extends RulesConfig> = {
    readonly minimax: MinimaxConfig<M, S, C>[],
    readonly mcts: MCTSConfig<M, S, C>[],
}

export const NoAIConfig: AIConfig<Move, GameState, RulesConfig> = {
    minimax: [],
    mcts: [],
};
