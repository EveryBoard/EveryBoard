import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { DvonnMinimax } from '../DvonnMinimax';
import { DvonnPieceStack } from '../DvonnPieceStack';
import { DvonnNode, DvonnRules } from '../DvonnRules';
import { DvonnState } from '../DvonnState';

describe('DvonnMinimax', () => {
    let rules: DvonnRules;
    let minimax: DvonnMinimax;

    const __: DvonnPieceStack = DvonnPieceStack.EMPTY;
    const D1: DvonnPieceStack = DvonnPieceStack.SOURCE;
    const O1: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
    const X2: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 2, false);

    beforeEach(() => {
        rules = new DvonnRules(DvonnState);
        minimax = new DvonnMinimax(rules, 'DvonnMinimax');
    });
    it('should propose 41 moves at first turn', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(41);
    });
    it('should compute board value as the score difference', () => {
        // Given a board
        const board: Table<DvonnPieceStack> = [
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, X2, D1, O1, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);

        // When computing the board value
        const value: number = minimax.getBoardValue(new DvonnNode(state)).value;

        // Then it should be 2 - 1 = 1
        expect(value).toBe(1);
    });
});
