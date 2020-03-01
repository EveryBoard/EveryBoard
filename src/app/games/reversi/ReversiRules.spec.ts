import { MGPMap } from 'src/app/collectionlib/MGPMap';
import { ReversiRules } from './ReversiRules';
import { ReversiMove } from './ReversiMove';
import { ReversiPartSlice } from './ReversiPartSlice';

describe('ReversiRules', () => {

    it('ReversiRules should be created', () => {
        const rules: ReversiRules = new ReversiRules();
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
        const moves: MGPMap<ReversiMove, ReversiPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toBe(4);
    });
});