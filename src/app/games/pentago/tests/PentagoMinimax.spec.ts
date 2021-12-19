import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { PentagoMinimax } from '../PentagoMinimax';
import { PentagoMove } from '../PentagoMove';
import { PentagoNode, PentagoRules } from '../PentagoRules';
import { PentagoState } from '../PentagoState';

describe('PentagoMinimax', () => {

    let rules: PentagoRules;
    let minimax: PentagoMinimax;
    const _: Player = Player.NONE;
    const O: Player = Player.ZERO;
    const X: Player = Player.ONE;

    beforeEach(() => {
        rules = new PentagoRules(PentagoState);
        minimax = new PentagoMinimax(rules, 'PentagoMinimax');
    });
    it('Should propose 6 moves at first turn', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(6);
    });
    it('Should propose to click on empty square afterward', () => {
        // Given a state with one piece on it
        const board: Table<Player> = [
            [O, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 1);
        rules.node = new PentagoNode(state,
                                     MGPOptional.of(rules.node),
                                     MGPOptional.of(PentagoMove.rotationless(0, 0)),
                                     minimax);

        /*
         * when calculating the list of moves, then there should be 105
         * so: 35 without any rotation
         * + the 3 center times 2 rotation of the first block (6)
         * + the 8 coords in the first block times the two rotations possibles (16)
         * + the 24 non center coords in the others blocks times 2 rotations (48)
         */
        const moves: PentagoMove[] = minimax.getListMoves(rules.node);

        // then the number should be 105
        expect(moves.length).toBe(35 + 6 + 16 + 48);
    });
    it('should not include drop when there is no neutral block', () => {
        // Given a state without neutralable block
        const board: Table<Player> = [
            [O, _, _, _, _, _],
            [_, X, _, _, X, _],
            [_, _, _, _, O, _],
            [_, _, _, _, _, O],
            [_, O, _, _, X, _],
            [_, _, X, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 8);
        rules.node = new PentagoNode(state, MGPOptional.of(rules.node), MGPOptional.empty(), minimax);

        /*
         * when calculating the list of moves
         * there should be 28 drop tilmes 8 rotations
         * and no rotationless moves
         */
        const moves: PentagoMove[] = minimax.getListMoves(rules.node);

        // then the number should be 28*8
        expect(moves.length).toBe(28 * 8);
    });
    it('Should only propose one rotation when we just made the last neutral block non-neutral', () => {
        // Given a state without neutralable block
        const board: Table<Player> = [
            [_, _, _, X, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, O],
            [_, _, _, _, _, _],
            [_, _, O, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 4);
        rules.node = new PentagoNode(state, MGPOptional.of(rules.node), MGPOptional.empty(), minimax);

        /*
         * when calculating the list of moves
         * there should be 24 drop not followed by no-rotations + rotations of the 6 others block (24 * 7)
         * + 8 drops followed only by clockwise rotation + rotations of the others 6 blocks (8 * 7)
         */
        const moves: PentagoMove[] = minimax.getListMoves(rules.node);

        // then the number should be (24+8) * 7
        expect(moves.length).toBe(32 * 7);
    });
});
