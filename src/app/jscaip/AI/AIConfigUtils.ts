import { Move } from '../Move';
import { SuperRules } from '../Rules';
import { RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { AbstractAI } from './AI';
import { MCTSConfig, MinimaxConfig } from './AIConfig';
import { IterativeDeepeningMinimax } from './IterativeDeepeningMinimax';
import { MCTS } from './MCTS';
import { MCTSWithHeuristic } from './MCTSWithHeuristic';
import { Minimax } from './Minimax';

export class AIInstanceRegistry<C extends object, S> {

    private readonly instances: Map<C, Map<S, AbstractAI>> = new Map();

    public getOrCreate<A extends AbstractAI>(config: C, strategy: S, factory: () => A): A {
        let instancesForConfig: Map<S, AbstractAI> | undefined = this.instances.get(config);
        if (instancesForConfig == null) {
            instancesForConfig = new Map();
            this.instances.set(config, instancesForConfig);
        }
        const existing: AbstractAI | undefined = instancesForConfig.get(strategy);
        if (existing != null) {
            return existing as A;
        }
        const ai: A = factory();
        instancesForConfig.set(strategy, ai);
        return ai;
    }

}

export function createMinimaxFromConfig<M extends Move,
                                        S extends GameState,
                                        C extends RulesConfig,
                                        L>(rules: SuperRules<M, S, C, L>,
                                           config: MinimaxConfig<M, S, C>)
: Minimax<M, S, C, L>
{
    const minimax: Minimax<M, S, C, L> =
        new Minimax(config.name, rules, config.heuristic(), config.moveGenerator(), config.hash);
    minimax.configureFromConfig(config);
    return minimax;
}

export function createIterativeDeepeningMinimaxFromConfig<M extends Move,
                                                          S extends GameState,
                                                          C extends RulesConfig,
                                                          L>(rules: SuperRules<M, S, C, L>,
                                                             config: MinimaxConfig<M, S, C>)
: IterativeDeepeningMinimax<M, S, C, L>
{
    const minimax: IterativeDeepeningMinimax<M, S, C, L> =
        new IterativeDeepeningMinimax(config.name,
                                      rules,
                                      config.heuristic(),
                                      config.moveGenerator(),
                                      config.hash);
    minimax.configureFromConfig(config);
    return minimax;
}

export function createMCTSFromConfig<M extends Move,
                                     S extends GameState,
                                     C extends RulesConfig,
                                     L>(rules: SuperRules<M, S, C, L>,
                                        config: MCTSConfig<M, S, C>)
: MCTS<M, S, C, L>
{
    if (config.heuristic == null) {
        return new MCTS(config.name, config.moveGenerator(), rules);
    } else {
        return new MCTSWithHeuristic(config.name, config.moveGenerator(), rules, config.heuristic());
    }
}
