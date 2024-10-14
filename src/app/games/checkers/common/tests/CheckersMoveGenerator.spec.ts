/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { CheckersMove } from '../CheckersMove';
import { CheckersMoveGenerator } from '../CheckersMoveGenerator';
import { AbstractCheckersRules, CheckersConfig, CheckersNode } from '../AbstractCheckersRules';
import { CheckersPiece, CheckersStack, CheckersState } from '../CheckersState';
import { InternationalCheckersRules } from '../../international-checkers/InternationalCheckersRules';
import { LascaRules } from '../../lasca/LascaRules';

const u: CheckersStack = new CheckersStack([CheckersPiece.ZERO]);
const v: CheckersStack = new CheckersStack([CheckersPiece.ONE]);
const _: CheckersStack = CheckersStack.EMPTY;

const rules: AbstractCheckersRules[] = [
    InternationalCheckersRules.get(),
    LascaRules.get(),
];

for (const rule of rules) {

    describe('CheckersControlMoveGenerator for ' + rule.constructor.name, () => {

        let moveGenerator: CheckersMoveGenerator;
        const defaultConfig: MGPOptional<CheckersConfig> = rule.getDefaultRulesConfig();

        beforeEach(() => {
            moveGenerator = new CheckersMoveGenerator(rule);
        });

        it('should return full list of captures when capture must be done', () => {
            // Given a state where current player should capture
            const state: CheckersState = CheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, v, _, _, _, _],
                [_, u, _, u, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, u, _],
                [_, _, _, _, _, _, _],
            ], 1);
            const node: CheckersNode = new CheckersNode(state);

            // When listing the moves
            const moves: CheckersMove[] = moveGenerator.getListMoves(node, defaultConfig);

            // Then it should return the list of capture
            expect(moves.length).toBe(2);
        });

        it('should return full list of steps when no capture must be done', () => {
            // Given a state where only steps can be made
            const state: CheckersState = rule.getInitialState(defaultConfig);
            const node: CheckersNode = new CheckersNode(state);

            // When listing the moves
            const moves: CheckersMove[] = moveGenerator.getListMoves(node, defaultConfig);

            // Then it should return the list of steps
            expect(moves.length).toBe(6);
        });

    });

}
