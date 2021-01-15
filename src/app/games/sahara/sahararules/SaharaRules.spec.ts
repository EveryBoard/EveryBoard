import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { SaharaRules } from './SaharaRules';
import { SaharaMove } from '../saharamove/SaharaMove';
import { SaharaPartSlice } from '../SaharaPartSlice';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { SaharaPawn } from '../SaharaPawn';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('SaharaRules', () => {
    let rules: SaharaRules;

    beforeAll(() => {
        SaharaRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || SaharaRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new SaharaRules(SaharaPartSlice);
    });
    it('SaharaRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, 'Game should start a turn 0');
        const moves: MGPMap<SaharaMove, SaharaPartSlice> = rules.getListMoves(rules.node);
        expect(moves.containsKey(new SaharaMove(new Coord( 2, 0), new Coord(2, 1)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 7, 0), new Coord(6, 0)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 7, 0), new Coord(5, 0)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 7, 0), new Coord(6, 1)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord(10, 2), new Coord(9, 2)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 0, 3), new Coord(1, 3)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 0, 3), new Coord(2, 3)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 0, 3), new Coord(1, 4)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 3, 5), new Coord(4, 5)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 8, 5), new Coord(8, 4)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 8, 5), new Coord(7, 4)))).toBeTrue();
        expect(moves.containsKey(new SaharaMove(new Coord( 8, 5), new Coord(9, 4)))).toBeTrue();
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
        expect(rules.choose(new SaharaMove(new Coord(0, 3), new Coord(1, 4)))).toBeTrue();
        expect(rules.node.gamePartSlice.getBoardAt(new Coord(1, 4))).toBe(SaharaPawn.BLACK, 'Just moved black piece should be in her landing spot');
        expect(rules.node.gamePartSlice.getBoardAt(new Coord(0, 3))).toBe(SaharaPawn.EMPTY, 'Just moved black piece should have left her initial spot');
        expect(rules.choose(new SaharaMove(new Coord(3, 0), new Coord(4, 0)))).toBeTrue();
        expect(rules.choose(new SaharaMove(new Coord(1, 4), new Coord(2, 4)))).toBeTrue();
        expect(rules.node.ownValue).toBe(Number.MIN_SAFE_INTEGER, 'Should be victory');
    });
    it('Bouncing on occupied case should be illegal', () => {
        expect(rules.choose(new SaharaMove(new Coord(7, 0), new Coord(8, 1)))).toBeFalse();
    });
});
