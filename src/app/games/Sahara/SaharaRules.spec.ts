import { MGPMap } from 'src/app/collectionlib/MGPMap';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaRules } from './SaharaRules';
import { SaharaMove } from './SaharaMove';
import { SaharaPartSlice } from './SaharaPartSlice';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerboard';
import { SaharaPawn } from './SaharaPawn';

describe('SaharaRules', () => {

    it('SaharaRules should be created', () => {
        const rules: SaharaRules = new SaharaRules();
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
        const moves: MGPMap<SaharaMove, SaharaPartSlice> = rules.getListMoves(rules.node);
        expect(moves.containsKey(new SaharaMove(new Coord( 2, 0), new Coord(2, 1)))).toBeTruthy(" 0");
        expect(moves.containsKey(new SaharaMove(new Coord( 7, 0), new Coord(6, 0)))).toBeTruthy(" 1");
        expect(moves.containsKey(new SaharaMove(new Coord( 7, 0), new Coord(5, 0)))).toBeTruthy(" 2");
        expect(moves.containsKey(new SaharaMove(new Coord( 7, 0), new Coord(6, 1)))).toBeTruthy(" 3");
        expect(moves.containsKey(new SaharaMove(new Coord(10, 2), new Coord(9, 2)))).toBeTruthy(" 4");
        expect(moves.containsKey(new SaharaMove(new Coord( 0, 3), new Coord(1, 3)))).toBeTruthy(" 5");
        expect(moves.containsKey(new SaharaMove(new Coord( 0, 3), new Coord(2, 3)))).toBeTruthy(" 6");
        expect(moves.containsKey(new SaharaMove(new Coord( 0, 3), new Coord(1, 4)))).toBeTruthy(" 7");
        expect(moves.containsKey(new SaharaMove(new Coord( 3, 5), new Coord(4, 5)))).toBeTruthy(" 8");
        expect(moves.containsKey(new SaharaMove(new Coord( 8, 5), new Coord(8, 4)))).toBeTruthy(" 9");
        expect(moves.containsKey(new SaharaMove(new Coord( 8, 5), new Coord(7, 4)))).toBeTruthy("10");
        expect(moves.containsKey(new SaharaMove(new Coord( 8, 5), new Coord(9, 4)))).toBeTruthy("11");
        expect(moves.size()).toBe(12);
    });
    it('TriangularCheckerBoard should always give 3 neighboors', () => {
        for (let y=0; y<SaharaPartSlice.HEIGHT; y++) {
            for (let x=0; x<SaharaPartSlice.WIDTH; x++) {
                expect(TriangularCheckerBoard.getNeighboors(new Coord(x, y)).length).toBe(3);
            }
        }
    });
    it('Shortest victory simulation', () => {
        const rules: SaharaRules = new SaharaRules();
        expect(rules.choose(new SaharaMove(new Coord(0, 3), new Coord(1, 4)))).toBeTruthy("First move should be legal");
        expect(rules.node.gamePartSlice.getBoardAt(new Coord(1, 4))).toBe(SaharaPawn.BLACK, 'Just moved black piece should be in her landing spot');
        expect(rules.node.gamePartSlice.getBoardAt(new Coord(0, 3))).toBe(SaharaPawn.EMPTY, 'Just moved black piece should have left her initial spot');
        expect(rules.choose(new SaharaMove(new Coord(3, 0), new Coord(4, 0)))).toBeTruthy("Second move should be legal");
        expect(rules.choose(new SaharaMove(new Coord(1, 4), new Coord(2, 4)))).toBeTruthy("First move should be legal");
        expect(rules.node.ownValue).toBe(Number.MIN_SAFE_INTEGER, "Should be victory");
    });
});