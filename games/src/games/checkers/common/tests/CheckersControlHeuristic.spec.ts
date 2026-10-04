/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Player } from '../../../../jscaip/Player';
import { InternationalCheckersRules } from '../../international-checkers/InternationalCheckersRules';
import { LascaRules } from '../../lasca/LascaRules';
import { AbstractCheckersRules, CheckersConfig } from '../AbstractCheckersRules';
import { CheckersControlHeuristic } from '../CheckersControlHeuristic';
import { CheckersPiece, CheckersStack, CheckersState, EvenCheckersState } from '../CheckersState';

const u: CheckersStack = new CheckersStack([CheckersPiece.ZERO]);
const v: CheckersStack = new CheckersStack([CheckersPiece.ONE]);
const _: CheckersStack = CheckersStack.EMPTY;

const rules: AbstractCheckersRules[] = [
    InternationalCheckersRules.get(),
    LascaRules.get(),
];

for (const rule of rules) {

    describe('CheckersControlHeuristic for ' + rule.constructor.name, () => {

        let heuristic: CheckersControlHeuristic;
        const defaultConfig: CheckersConfig = rule.getDefaultRulesConfig();

        beforeEach(() => {
            heuristic = new CheckersControlHeuristic(rule);
        });

        it('should not count the immobilized stacks', () => {
            // Given two boards with the exact same stacks, one having blocked stacks
            const immobilizedState: CheckersState = EvenCheckersState.of([
                [v, _, _, _, _, _, _],
                [_, u, _, _, _, _, _],
                [_, _, u, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, v, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 0);
            const mobileState: CheckersState = EvenCheckersState.of([
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
            // Given two boards with the same stacks, one with a unique forced capture, the other without
            const forcedState: CheckersState = EvenCheckersState.of([
                [v, _, _, _, _, _, _],
                [_, u, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, v, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 0); // O has 1 stack, X has 2
            const freeState: CheckersState = EvenCheckersState.of([
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
            // the number of non-blocked stacks
            HeuristicUtils.expectStatesToBeOfEqualValue(heuristic, forcedState, freeState, defaultConfig);
        });

    });

}
