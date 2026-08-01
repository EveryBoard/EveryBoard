import { Move } from '../Move';
import { SuperRules } from '../Rules';
import { RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { MinimaxConfig } from './AIConfig';
import { IterativeDeepeningMinimax } from './IterativeDeepeningMinimax';
import { Minimax } from './Minimax';

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
