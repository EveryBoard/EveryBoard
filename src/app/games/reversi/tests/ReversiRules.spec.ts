import { ReversiRules } from '../ReversiRules';
import { ReversiMinimax } from '../ReversiMinimax';
import { ReversiMove } from '../ReversiMove';
import { ReversiPartSlice } from '../ReversiPartSlice';
import { Player } from 'src/app/jscaip/Player';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { ReversiLegalityStatus } from '../ReversiLegalityStatus';

describe('ReversiRules', () => {
    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    let rules: ReversiRules;
    let minimax: ReversiMinimax;

    beforeEach(() => {
        rules = new ReversiRules(ReversiPartSlice);
        minimax = new ReversiMinimax('ReversiMinimax');
    });
    it('ReversiRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, 'Game should start a turn 0');
        const moves: ReversiMove[] = minimax.getListMoves(rules.node);
        expect(moves.length).toBe(4);
    });
    it('First move should be legal and change score', () => {
        const isLegal: boolean = rules.choose(new ReversiMove(2, 4));

        expect(isLegal).toBeTrue();
        expect(rules.node.gamePartSlice.countScore()).toEqual([4, 1]);
    });
    it('Passing at first turn should be illegal', () => {
        const isLegal: boolean = rules.choose(ReversiMove.PASS);

        expect(isLegal).toBeFalse();
    });
    it('should forbid non capturing move', () => {
        const moveLegality: boolean = rules.choose(new ReversiMove(0, 0));

        expect(moveLegality).toBeFalse();
    });
    it('should forbid choosing occupied case', () => {
        const moveLegality: boolean = rules.choose(new ReversiMove(3, 3));

        expect(moveLegality).toBeFalse();
    });
    it('Should allow player to pass when no other moves are possible', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, O, _, _, _],
        ];
        const slice: ReversiPartSlice = new ReversiPartSlice(board, 1);
        rules.node = new MGPNode(null, null, slice);
        const moves: ReversiMove[] = minimax.getListMoves(rules.node);
        expect(moves.length).toBe(1);
        expect(moves[0]).toBe(ReversiMove.PASS);
        expect(rules.choose(ReversiMove.PASS)).toBeTrue();
    });
    it('Should consider the player with the more point the winner at the end', () => {
        const board: NumberTable = [
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 0, 1, 1, 0],
            [0, 1, 0, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 0, 1, 0],
            [0, 1, 1, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [2, 0, 0, 0, 0, 0, 1, 0],
        ];
        const expectedBoard: NumberTable = [
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 0, 1, 1, 0],
            [0, 1, 0, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 0, 1, 0],
            [0, 1, 1, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 0],
        ];
        const slice: ReversiPartSlice = new ReversiPartSlice(board, 59);
        const move: ReversiMove = new ReversiMove(0, 7);
        const status: ReversiLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: ReversiPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: ReversiPartSlice = new ReversiPartSlice(expectedBoard, 60);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(minimax.getBoardValue(new MGPNode(null, move, expectedSlice)).value)
            .toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for player 1');
    });
});
