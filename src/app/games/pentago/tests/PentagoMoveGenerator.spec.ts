/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { PentagoMove } from '../PentagoMove';
import { PentagoMoveGenerator } from '../PentagoMoveGenerator';
import { PentagoNode, PentagoRules } from '../PentagoRules';
import { PentagoState } from '../PentagoState';

describe('PentagoMoveGenerator', () => {

    let rules: PentagoRules;
    let moveGenerator: PentagoMoveGenerator;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        rules = PentagoRules.get();
        moveGenerator = new PentagoMoveGenerator();
    });
    it('should propose 6 moves at first turn', () => {
        const node: PentagoNode = rules.getInitialNode();
        expect(moveGenerator.getListMoves(node).length).toBe(6);
    });
    it('should propose to click on empty square afterward', () => {
        // Given a state with one piece on it
        const board: Table<PlayerOrNone> = [
            [O, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 1);
        const node: PentagoNode = new PentagoNode(state,
                                                  MGPOptional.of(rules.getInitialNode()),
                                                  MGPOptional.of(PentagoMove.rotationless(0, 0)));
        /*
         * when calculating the list of moves, then there should be 105
         * so: 35 without any rotation
         * + the 3 center times 2 rotation of the first block (6)
         * + the 8 coords in the first block times the two rotations possibles (16)
         * + the 24 non center coords in the others blocks times 2 rotations (48)
         */
        const moves: PentagoMove[] = moveGenerator.getListMoves(node);

        // Then the number should be 105
        expect(moves.length).toBe(35 + 6 + 16 + 48);
    });
    it('should not include drop when there is no neutral block', () => {
        // Given a state without neutralable block
        const board: Table<PlayerOrNone> = [
            [O, _, _, _, _, _],
            [_, X, _, _, X, _],
            [_, _, _, _, O, _],
            [_, _, _, _, _, O],
            [_, O, _, _, X, _],
            [_, _, X, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 8);
        const node: PentagoNode = new PentagoNode(state, MGPOptional.of(rules.getInitialNode()), MGPOptional.empty());
        /*
         * when calculating the list of moves
         * there should be 28 drop tilmes 8 rotations
         * and no rotationless moves
         */
        const moves: PentagoMove[] = moveGenerator.getListMoves(node);

        // Then the number should be 28*8
        expect(moves.length).toBe(28 * 8);
    });
    it('should only propose one rotation when we just made the last neutral block non-neutral', () => {
        // Given a state without neutralable block
        const board: Table<PlayerOrNone> = [
            [_, _, _, X, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, O],
            [_, _, _, _, _, _],
            [_, _, O, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 4);
        const node: PentagoNode = new PentagoNode(state, MGPOptional.of(rules.getInitialNode()), MGPOptional.empty());

        /*
         * when calculating the list of moves
         * there should be 24 drop not followed by no-rotations + rotations of the 6 others block (24 * 7)
         * + 8 drops followed only by clockwise rotation + rotations of the others 6 blocks (8 * 7)
         */
        const moves: PentagoMove[] = moveGenerator.getListMoves(node);

        // Then the number should be (24+8) * 7
        expect(moves.length).toBe(32 * 7);
    });
});
