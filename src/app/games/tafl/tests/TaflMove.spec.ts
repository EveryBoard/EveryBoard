import { TablutRules } from '../tablut/TablutRules';
import { TaflMinimax } from '../TaflMinimax';
import { TaflEncoder, TaflMove } from '../TaflMove';
import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { MyTaflMove } from './MyTaflMove.spec';

describe('TaflMove', () => {

    it('encoder should be correct', () => {
        const encoder: TaflEncoder<MyTaflMove> =
            new TaflEncoder(9, (start: Coord, end: Coord) => new MyTaflMove(start, end));
        const rules: TablutRules = TablutRules.get();
        rules.node = rules.node.getInitialNode();
        const minimax: TaflMinimax = new TaflMinimax(rules, 'TablutMinimax');
        const firstTurnMoves: TaflMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            NumberEncoderTestUtils.expectToBeCorrect(encoder, move);
        }
    });
    it('TablutMove creation, as a MoveCoordToCoord, should throw when created immobile', () => {
        expect(() => new MyTaflMove(new Coord(0, 0), new Coord(0, 0)))
            .toThrowError('MoveCoordToCoord cannot be static.');
    });
    it('Should throw when given out of range coords', () => {
        const outOfRange: Coord = new Coord(-1, -1);
        const inRange: Coord = new Coord(0, 0);
        expect(() => new MyTaflMove(outOfRange, inRange))
            .toThrowError('Starting coord of TaflMove must be on the board, not at (-1, -1).');
        expect(() => new MyTaflMove(inRange, outOfRange))
            .toThrowError('Landing coord of TaflMove must be on the board, not at (-1, -1).');
    });
    it('TablutMove must throw if created non-orthogonally', () => {
        expect(() => new MyTaflMove(new Coord(0, 0), new Coord(1, 1))).toThrowError('TaflMove cannot be diagonal.');
    });
    it('Should override equals and toString correctly', () => {
        const a: Coord = new Coord(0, 0);
        const b: Coord = new Coord(0, 1);
        const c: Coord = new Coord(0, 2);
        const move: TaflMove = new MyTaflMove(a, b);
        const neighboors: TaflMove = new MyTaflMove(a, c);
        const cousin: TaflMove = new MyTaflMove(c, b);
        const twin: TaflMove = new MyTaflMove(a, b);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighboors)).toBeFalse();
        expect(move.equals(cousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();

        expect(move.toString()).toEqual('TaflMove((0, 0)->(0, 1))');
    });
});
