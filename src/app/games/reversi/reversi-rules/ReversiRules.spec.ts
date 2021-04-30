import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { ReversiRules } from './ReversiRules';
import { ReversiMove } from '../reversi-move/ReversiMove';
import { ReversiPartSlice } from '../ReversiPartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { ReversiLegalityStatus } from '../ReversiLegalityStatus';

describe('ReversiRules', () => {
    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    let rules: ReversiRules;

    beforeEach(() => {
        rules = new ReversiRules(ReversiPartSlice);
    });
    it('ReversiRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, 'Game should start a turn 0');
        const moves: MGPMap<ReversiMove, ReversiPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toBe(4);
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
        rules.node = new MGPNode(null, null, slice, 0);
        const moves: MGPMap<ReversiMove, ReversiPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toBe(1);
        expect(moves.getByIndex(0).key).toBe(ReversiMove.PASS);
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
        expect(rules.getBoardValue(move, expectedSlice))
            .toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for player 1');
    });
});
