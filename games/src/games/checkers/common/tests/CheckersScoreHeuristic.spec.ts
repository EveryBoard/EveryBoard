

import { GameNode } from '../../../../jscaip/AI/GameNode';
import { HeuristicUtils } from '../../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Player } from '../../../../jscaip/Player';
import { InternationalCheckersRules } from '../../international-checkers/InternationalCheckersRules';
import { LascaRules } from '../../lasca/LascaRules';
import { AbstractCheckersRules, CheckersConfig } from '../AbstractCheckersRules';
import { CheckersScoreHeuristic } from '../CheckersScoreHeuristic';
import { CheckersPiece, CheckersStack, CheckersState, EvenCheckersState } from '../CheckersState';

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
            const equalityState: CheckersState = EvenCheckersState.of([
                [v, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, u],
            ], 0);
            const oneDominatedState: CheckersState = EvenCheckersState.of([
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
            HeuristicUtils.expectNodeToBeBetterFor(
                heuristic,
                GameNode.root(oneDominatedState),
                GameNode.root(equalityState),
                Player.ONE,
                defaultConfig,
            );
        });

    });

}
