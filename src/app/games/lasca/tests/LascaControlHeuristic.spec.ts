/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from '@everyboard/lib';
import { LascaControlHeuristic } from '../LascaControlHeuristic';
import { LascaPiece, LascaStack, LascaState } from '../LascaState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { LascaRules } from '../LascaRules';
import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';

const u: LascaStack = new LascaStack([LascaPiece.ZERO]);
const v: LascaStack = new LascaStack([LascaPiece.ONE]);
const _: LascaStack = LascaStack.EMPTY;

describe('LascaControlHeuristic', () => {

    let heuristic: LascaControlHeuristic;
    const defaultConfig: NoConfig = LascaRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new LascaControlHeuristic();
    });

    it('should not count the immobilized stacks', () => {
        // Given two boards with the exact same stacks, one having blocked stacks
        const immobilizedState: LascaState = LascaState.of([
            [v, _, _, _, _, _, _],
            [_, u, _, _, _, _, _],
            [_, _, u, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0);
        const mobileState: LascaState = LascaState.of([
            [v, _, _, _, _, _, _],
            [_, _, _, u, _, _, _],
            [_, _, u, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0);

        // When comparing them
        // Then the one with mobile stacks should be considered better
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               immobilizedState,
                                                               MGPOptional.empty(),
                                                               mobileState,
                                                               MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

    it('should count the potential mobility as primary board value', () => {
        // Given two boards with the same stacks, one with an unique forced capture, the other without
        const forcedState: LascaState = LascaState.of([
            [v, _, _, _, _, _, _],
            [_, u, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0); // O has 1 stack, X has 2
        const freeState: LascaState = LascaState.of([
            [v, _, _, _, _, _, _],
            [_, _, _, u, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0); // O has 1 stack, X has 2

        // When comparing them
        // Then the two should be of equal value:
        //     the number of non-blocked stacks times the number of piece (which is 11)
        HeuristicUtils.expectStatesToBeOfEqualValue(heuristic, forcedState, freeState, defaultConfig);
    });

});
