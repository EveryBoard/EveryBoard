import { MGPMap } from 'src/app/collectionlib/MGPMap';
import { ReversiRules } from './ReversiRules';
import { ReversiMove } from './ReversiMove';
import { ReversiPartSlice } from './ReversiPartSlice';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('ReversiRules', () => {

    let rules: ReversiRules;

    beforeAll(() => {
        ReversiRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(() => {
        rules = new ReversiRules();
    });
    it('ReversiRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
        const moves: MGPMap<ReversiMove, ReversiPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toBe(4);
    });
    it('First move should be legal and change score', () => {
        const isLegal: boolean = rules.choose(new ReversiMove(2, 4));

        expect(isLegal).toBeTruthy();
        expect(rules.node.gamePartSlice.countScore()).toEqual([4, 1]);
    });
    it('Passing at first turn should be illegal', () => {
        const isLegal: boolean = rules.choose(ReversiMove.pass);

        expect(isLegal).toBeFalsy();
    });
});