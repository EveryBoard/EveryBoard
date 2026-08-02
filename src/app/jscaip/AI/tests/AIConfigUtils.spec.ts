import { P4Heuristic } from '../../../games/p4/P4Heuristic';
import { P4Move } from '../../../games/p4/P4Move';
import { P4MoveGenerator } from '../../../games/p4/P4MoveGenerator';
import { P4Config, P4Rules } from '../../../games/p4/P4Rules';
import { P4State } from '../../../games/p4/P4State';
import { MCTSConfig } from '../AIConfig';
import { AIInstanceRegistry, createMCTSFromConfig } from '../AIConfigUtils';
import { MCTS } from '../MCTS';
import { MCTSWithHeuristic } from '../MCTSWithHeuristic';

describe('AIConfigUtils', () => {

    const rules: P4Rules = P4Rules.get();

    it('should create a regular MCTS when the config has no heuristic', () => {
        const config: MCTSConfig<P4Move, P4State, P4Config> = {
            id: 'default',
            name: 'Default',
            moveGenerator: () => new P4MoveGenerator(),
        };

        const mcts: MCTS<P4Move, P4State, P4Config> = createMCTSFromConfig(rules, config);

        expect(mcts).toEqual(jasmine.any(MCTS));
        expect(mcts).not.toEqual(jasmine.any(MCTSWithHeuristic));
    });

    it('should create an MCTS with heuristic when the config has one', () => {
        const config: MCTSConfig<P4Move, P4State, P4Config> = {
            id: 'alignment',
            name: 'Alignment',
            moveGenerator: () => new P4MoveGenerator(),
            heuristic: () => new P4Heuristic(),
        };

        const mcts: MCTS<P4Move, P4State, P4Config> = createMCTSFromConfig(rules, config);

        expect(mcts).toEqual(jasmine.any(MCTSWithHeuristic));
    });

    it('should reuse one AI instance per configuration and strategy', () => {
        const config: MCTSConfig<P4Move, P4State, P4Config> = {
            id: 'default',
            name: 'Default',
            moveGenerator: () => new P4MoveGenerator(),
        };
        const registry: AIInstanceRegistry<MCTSConfig<P4Move, P4State, P4Config>, 'first' | 'second'> =
            new AIInstanceRegistry();

        const first: MCTS<P4Move, P4State, P4Config> =
            registry.getOrCreate(config, 'first', () => createMCTSFromConfig(rules, config));
        const firstAgain: MCTS<P4Move, P4State, P4Config> =
            registry.getOrCreate(config, 'first', () => createMCTSFromConfig(rules, config));
        const second: MCTS<P4Move, P4State, P4Config> =
            registry.getOrCreate(config, 'second', () => createMCTSFromConfig(rules, config));

        expect(firstAgain).toBe(first);
        expect(second).not.toBe(first);
    });

});
