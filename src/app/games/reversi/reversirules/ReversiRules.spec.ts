import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { ReversiRules } from './ReversiRules';
import { ReversiMove } from '../reversimove/ReversiMove';
import { ReversiPartSlice } from '../ReversiPartSlice';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPNode } from 'src/app/jscaip/mgpnode/MGPNode';

describe('ReversiRules', () => {

    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    let rules: ReversiRules;

    beforeAll(() => {
        ReversiRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || ReversiRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new ReversiRules(ReversiPartSlice);
    });
    it('ReversiRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
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
            [_, _, _, _, _, _, _, _,],
            [_, _, _, _, _, _, _, _,],
            [_, _, _, _, _, _, _, _,],
            [_, _, _, _, _, _, _, _,],
            [_, _, _, _, _, _, _, _,],
            [_, _, _, _, _, _, _, _,],
            [_, _, _, _, X, _, _, _,],
            [_, _, _, _, O, _, _, _,],
        ];
        const slice: ReversiPartSlice = new ReversiPartSlice(board, 1);
        rules.node = new MGPNode(null, null, slice, 0);
        const moves: MGPMap<ReversiMove, ReversiPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toBe(1);
        expect(moves.getByIndex(0).key).toBe(ReversiMove.PASS);
        expect(rules.choose(ReversiMove.PASS)).toBeTrue();
    });
});