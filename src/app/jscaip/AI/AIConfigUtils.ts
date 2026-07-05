import { Utils } from '@everyboard/lib';

import { Move } from '../Move';
import { SuperRules } from '../Rules';
import { RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { MoveGenerator } from './AI';
import { MinimaxConfig } from './AIConfig';
import { BoardValue } from './BoardValue';
import { Heuristic } from './Heuristic';
import { IterativeDeepeningMinimax } from './IterativeDeepeningMinimax';
import { Minimax } from './Minimax';

function getMinimaxConfigDependencies<M extends Move,
                                      S extends GameState,
                                      C extends RulesConfig>(config: MinimaxConfig<M, S, C>)
: {
    heuristic: Heuristic<M, S, BoardValue, C>,
    moveGenerator: MoveGenerator<M, S, C>,
}
{
    const heuristic: (() => Heuristic<M, S, BoardValue, C>) | undefined = config.heuristic;
    const moveGenerator: (() => MoveGenerator<M, S, C>) | undefined = config.moveGenerator;
    Utils.assert(heuristic != null, 'Minimax config should provide a heuristic');
    Utils.assert(moveGenerator != null, 'Minimax config should provide a moveGenerator');
    return {
        heuristic: heuristic!(),
        moveGenerator: moveGenerator!(),
    };
}

export function createMinimaxFromConfig<M extends Move,
                                        S extends GameState,
                                        C extends RulesConfig,
                                        L>(rules: SuperRules<M, S, C, L>,
                                           config: MinimaxConfig<M, S, C>)
: Minimax<M, S, C, L>
{
    const dependencies: {
        heuristic: Heuristic<M, S, BoardValue, C>,
        moveGenerator: MoveGenerator<M, S, C>,
    } = getMinimaxConfigDependencies(config);
    const minimax: Minimax<M, S, C, L> =
        new Minimax(config.name, rules, dependencies.heuristic, dependencies.moveGenerator, config.hash);
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
    const dependencies: {
        heuristic: Heuristic<M, S, BoardValue, C>,
        moveGenerator: MoveGenerator<M, S, C>,
    } = getMinimaxConfigDependencies(config);
    const minimax: IterativeDeepeningMinimax<M, S, C, L> =
        new IterativeDeepeningMinimax(config.name,
                                      rules,
                                      dependencies.heuristic,
                                      dependencies.moveGenerator,
                                      config.hash);
    minimax.configureFromConfig(config);
    return minimax;
}
