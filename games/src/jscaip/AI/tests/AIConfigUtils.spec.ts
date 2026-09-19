/* eslint-disable max-lines-per-function */
import { P4Heuristic } from '../../../games/p4/P4Heuristic';
import { P4Move } from '../../../games/p4/P4Move';
import { P4MoveGenerator } from '../../../games/p4/P4MoveGenerator';
import { P4Rules } from '../../../games/p4/P4Rules';
import { P4State } from '../../../games/p4/P4State';
import { MCTSConfig, MinimaxConfig } from '../AIConfig';
import { AIInstanceRegistry, createIterativeDeepeningMinimaxFromConfig, createMCTSFromConfig, createMinimaxFromConfig } from '../AIConfigUtils';
import { IterativeDeepeningMinimax } from '../IterativeDeepeningMinimax';
import { MCTS } from '../MCTS';
import { MCTSWithHeuristic } from '../MCTSWithHeuristic';
import { Minimax } from '../Minimax';

describe('AIConfigUtils', () => {

    const rules: P4Rules = P4Rules.get();

    it('should create a regular MCTS when the config has no heuristic', () => {
        // Given an MCTS config without heuristic
        const config: MCTSConfig<P4Move, P4State, P4Config> = {
            id: 'default',
            name: 'Default',
            moveGenerator: () => new P4MoveGenerator(),
        };

        // When creating it
        const mcts: MCTS<P4Move, P4State, P4Config> = createMCTSFromConfig(rules, config);

        // Then it should be an MCTS and not an MCTSWithHeuristic
        expect(mcts).toEqual(jasmine.any(MCTS));
        expect(mcts).not.toEqual(jasmine.any(MCTSWithHeuristic));
    });

    it('should create an MCTS with heuristic when the config has one', () => {
        // Given an MCTS config with heuristic
        const config: MCTSConfig<P4Move, P4State, P4Config> = {
            id: 'alignment',
            name: 'Alignment',
            moveGenerator: () => new P4MoveGenerator(),
            heuristic: () => new P4Heuristic(),
        };

        // When creating it
        const mcts: MCTS<P4Move, P4State, P4Config> = createMCTSFromConfig(rules, config);

        // Then it should be an MCTSWithHeuristic
        expect(mcts).toEqual(jasmine.any(MCTSWithHeuristic));
    });

    it('should reuse one AI instance per configuration and strategy', () => {
        // Given an AIInstanceRegistry with one minimax (not iterative deepening)
        const config: MinimaxConfig<P4Move, P4State, P4Config> = {
            id: 'alignment',
            name: 'Alignment',
            heuristic: () => new P4Heuristic(),
            moveGenerator: () => new P4MoveGenerator(),
        };
        const registry: AIInstanceRegistry = new AIInstanceRegistry();

        const minimax: Minimax<P4Move, P4State, P4Config> =
            registry.getOrCreate(config, 'minimax', () => createMinimaxFromConfig(rules, config));
        // When accessing the same minimax
        const minimaxAgain: Minimax<P4Move, P4State, P4Config> =
            registry.getOrCreate(config, 'minimax', () => createMinimaxFromConfig(rules, config));
        // Then it should be the same object
        expect(minimaxAgain).toBe(minimax);

        // And when accessing a different minimax (iterative deepening)
        const iterativeDeepening: IterativeDeepeningMinimax<P4Move, P4State, P4Config> =
            registry.getOrCreate(config, 'iterative-deepening', () =>
                createIterativeDeepeningMinimaxFromConfig(rules, config),
            );
        // Then it should be different from the previous one
        expect<unknown>(iterativeDeepening).not.toBe(minimax);
    });

});
