/* eslint-disable max-lines-per-function */
import { ConspirateursState } from '../ConspirateursState';
import { ConspirateursRules, ConspirateursNode } from '../ConspirateursRules';
import { ConspirateursMinimax } from '../ConspirateursMinimax';
import { Player } from 'src/app/jscaip/Player';

fdescribe('ConspirateursMinimax', () => {
    const _: Player = Player.NONE;
    const A: Player = Player.ZERO;
    const B: Player = Player.ONE;

    let rules: ConspirateursRules;
    let minimax: ConspirateursMinimax;

    beforeEach(() => {
        rules = ConspirateursRules.get();
        minimax = new ConspirateursMinimax(rules, 'ConspirateursMinimax');
    });

    describe('drop phase', () => {
        it('should propose 45 moves at first turn', () => {
            // Given the initial state
            const node: ConspirateursNode = new ConspirateursNode(ConspirateursState.getInitialState());
            // Then there are 45 possible moves
            expect(minimax.getListMoves(node).length).toBe(45);
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
                [_, _, _, _, _, _, _, A, _, _, _, _, _, _, _, _, _],
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
            // Then there are 44 possible moves
            expect(minimax.getListMoves(node).length).toBe(44);
        });
    });
    describe('main phase', () => {
        it('should propose 9 moves on a specific board', () => {
            // Given a fictitious state after the drop phase
            const state: ConspirateursState = new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, B, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, B, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, A, _, _, _, _, _, _, _, _, _],
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
            expect(minimax.getListMoves(node).length).toBe(9);
        });
    });
});
