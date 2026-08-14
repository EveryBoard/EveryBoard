/* eslint-disable max-lines-per-function */
import { Player } from '@everyboard/games';
import { HeuristicUtils } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { InternationalCheckersRules } from '../../international-checkers/InternationalCheckersRules';
import { LascaRules } from '../../lasca/LascaRules';
import { AbstractCheckersRules, CheckersConfig } from '../AbstractCheckersRules';
import { CheckersScoreHeuristic } from '../CheckersScoreHeuristic';
import { CheckersPiece, CheckersStack, CheckersState } from '../CheckersState';

const u: CheckersStack = new CheckersStack([CheckersPiece.ZERO]);
const v: CheckersStack = new CheckersStack([CheckersPiece.ONE]);
const _: CheckersStack = CheckersStack.EMPTY;

const rules: AbstractCheckersRules[] = [
    InternationalCheckersRules.get(),
    LascaRules.get(),
];

for (const rule of rules) {

    describe('CheckersScoreHeuristic for ' + rule.constructor.name, () => {

        let heuristic: CheckersScoreHeuristic;
        const defaultConfig: CheckersConfig = rule.getDefaultRulesConfig();

        beforeEach(() => {
            heuristic = new CheckersScoreHeuristic();
        });

        it('should only be based on the score', () => {
            // Given two boards with differents number of pieces
            const equalityState: CheckersState = CheckersState.of([
                [v, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, u],
            ], 0);
            const oneDominatedState: CheckersState = CheckersState.of([
                [v, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, v, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, u, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 0);

            // When comparing them
            // Then the one with a better score for Player.ONE should be deemer
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   equalityState,
                                                                   MGPOptional.empty(),
                                                                   oneDominatedState,
                                                                   MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

    });

}
