import { Coord } from 'src/app/jscaip/Coord';
import { SaharaRules } from '../SaharaRules';
import { SaharaMinimax } from '../SaharaMinimax';
import { SaharaMove } from '../SaharaMove';
import { SaharaPartSlice } from '../SaharaPartSlice';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { SaharaPawn } from '../SaharaPawn';
import { MGPSet } from 'src/app/utils/MGPSet';

describe('SaharaRules', () => {

    let rules: SaharaRules;
    let minimax: SaharaMinimax;

    beforeEach(() => {
        rules = new SaharaRules(SaharaPartSlice);
        minimax = new SaharaMinimax(rules, 'SaharaMinimax');
    });
    it('SaharaRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, 'Game should start a turn 0');
        const moves: SaharaMove[] = minimax.getListMoves(rules.node);
        const expectedMoves: MGPSet<SaharaMove> = new MGPSet([
            new SaharaMove(new Coord( 2, 0), new Coord(2, 1)),
            new SaharaMove(new Coord( 7, 0), new Coord(6, 0)),
            new SaharaMove(new Coord( 7, 0), new Coord(5, 0)),
            new SaharaMove(new Coord( 7, 0), new Coord(6, 1)),
            new SaharaMove(new Coord(10, 2), new Coord(9, 2)),
            new SaharaMove(new Coord( 0, 3), new Coord(1, 3)),
            new SaharaMove(new Coord( 0, 3), new Coord(2, 3)),
            new SaharaMove(new Coord( 0, 3), new Coord(1, 4)),
            new SaharaMove(new Coord( 3, 5), new Coord(4, 5)),
            new SaharaMove(new Coord( 8, 5), new Coord(8, 4)),
            new SaharaMove(new Coord( 8, 5), new Coord(7, 4)),
            new SaharaMove(new Coord( 8, 5), new Coord(9, 4)),
        ]);
        expect(new MGPSet(moves).equals(expectedMoves)).toBeTrue();
        expect(moves.length).toBe(12);
    });
    it('TriangularCheckerBoard should always give 3 neighboors', () => {
        for (let y: number = 0; y < SaharaPartSlice.HEIGHT; y++) {
            for (let x: number = 0; x < SaharaPartSlice.WIDTH; x++) {
                expect(TriangularCheckerBoard.getNeighboors(new Coord(x, y)).length).toBe(3);
            }
        }
    });
    it('Shortest victory simulation', () => {
        expect(rules.choose(new SaharaMove(new Coord(0, 3), new Coord(1, 4)))).toBeTrue();
        expect(rules.node.gamePartSlice.getBoardAt(new Coord(1, 4)))
            .toBe(SaharaPawn.BLACK, 'Just moved black piece should be in her landing spot');
        expect(rules.node.gamePartSlice.getBoardAt(new Coord(0, 3)))
            .toBe(SaharaPawn.EMPTY, 'Just moved black piece should have left her initial spot');
        expect(rules.choose(new SaharaMove(new Coord(3, 0), new Coord(4, 0)))).toBeTrue();
        expect(rules.choose(new SaharaMove(new Coord(1, 4), new Coord(2, 4)))).toBeTrue();
        expect(rules.node.getOwnValue(minimax).value).toBe(Number.MIN_SAFE_INTEGER, 'Should be victory');
    });
    it('Bouncing on occupied case should be illegal', () => {
        expect(rules.choose(new SaharaMove(new Coord(7, 0), new Coord(8, 1)))).toBeFalse();
    });
});
