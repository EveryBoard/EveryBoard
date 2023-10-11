/* eslint-disable max-lines-per-function */
import { ConspirateursState } from '../ConspirateursState';
import { ConspirateursNode } from '../ConspirateursRules';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ConspirateursMoveGenerator } from '../ConspirateursMoveGenerator';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('ConspirateursMoveGenerator', () => {

    let moveGenerator: ConspirateursMoveGenerator;

    beforeEach(() => {
        moveGenerator = new ConspirateursMoveGenerator();
    });
    describe('drop phase', () => {
        it('should propose 45 moves at first turn', () => {
            // Given the initial state
            const node: ConspirateursNode = new ConspirateursNode(ConspirateursState.getInitialState());
            // Then there should be 45 possible moves
            expect(moveGenerator.getListMoves(node).length).toBe(45);
        });
        it('should propose 44 moves if there is already one piece placed', () => {
            // Given a state with already one piece dropped
            const state: ConspirateursState = new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);
            const node: ConspirateursNode = new ConspirateursNode(state);
            // Then there should be 44 possible moves
            expect(moveGenerator.getListMoves(node).length).toBe(44);
        });
    });
    describe('main phase', () => {
        it('should list all types of moves', () => {
            // Given a fictitious state after the drop phase
            const state: ConspirateursState = new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 42);
            const node: ConspirateursNode = new ConspirateursNode(state);
            // Then there are 7 simple moves + 2 jump moves
            expect(moveGenerator.getListMoves(node).length).toBe(9);
        });
    });
});