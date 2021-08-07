import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { AbaloneDummyMinimax } from '../AbaloneDummyMinimax';
import { AbaloneGameState } from '../AbaloneGameState';
import { AbaloneMove } from '../AbaloneMove';
import { AbaloneRules } from '../AbaloneRules';

describe('AbaloneMove', () => {

    it('should throw when not provided a direction or optional last piece', () => {
        expect(() => AbaloneMove.fromSingleCoord(new Coord(0, 0), null)).toThrowError('Direction cannot be null.');
        expect(() => AbaloneMove.fromDoubleCoord(new Coord(0, 0), null, HexaDirection.DOWN)).toThrowError('second coord cannot be null.');
    });
    it('should throw when creating move with more than three piece', () => {
        expect(() => AbaloneMove.fromDoubleCoord(new Coord(0, 0),
                                                 new Coord(3, 0),
                                                 HexaDirection.DOWN))
            .toThrowError('Distance between first coord and last coord is to great!');
    });
    it('should throw when created with an out of range coord', () => {
        const coord: Coord = new Coord(9, 9);
        const errorMessage: string = 'Coord ' + coord.toString() + ' out of range, invalid move!';
        expect(() => AbaloneMove.fromSingleCoord(coord, HexaDirection.DOWN)).toThrowError(errorMessage);
    });
    it('should map false double coord to single coord', () => {
        const up: Coord = new Coord(0, 0);
        const down: Coord = new Coord(0, 2);
        const distortedMove: AbaloneMove = AbaloneMove.fromDoubleCoord(up, down, HexaDirection.DOWN);
        const secondDistortedMove: AbaloneMove = AbaloneMove.fromDoubleCoord(down, up, HexaDirection.DOWN);
        const simpleMove: AbaloneMove = AbaloneMove.fromSingleCoord(up, HexaDirection.DOWN);
        expect(simpleMove.equals(distortedMove)).toBeTrue();
        expect(simpleMove.equals(secondDistortedMove)).toBeTrue();

        const distortedMove2: AbaloneMove = AbaloneMove.fromDoubleCoord(up, down, HexaDirection.UP);
        const simpleMove2: AbaloneMove = AbaloneMove.fromSingleCoord(down, HexaDirection.UP);
        expect(simpleMove2.equals(distortedMove2)).toBeTrue();
    });
    it('should spot identical translations and map them', () => {
        const up: Coord = new Coord(0, 0);
        const down: Coord = new Coord(0, 2);
        const normalMove: AbaloneMove = AbaloneMove.fromDoubleCoord(up, down, HexaDirection.LEFT);
        const distoredMove: AbaloneMove = AbaloneMove.fromDoubleCoord(down, up, HexaDirection.LEFT);
        expect(distoredMove.equals(normalMove)).toBeTrue();
    });
    it('should stringify nicely', () => {
        const singleCoord: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 0), HexaDirection.DOWN_LEFT);
        const doubleCoord: AbaloneMove = AbaloneMove.fromDoubleCoord(new Coord(0, 0),
                                                                     new Coord(2, 0),
                                                                     HexaDirection.DOWN);
        expect(singleCoord.toString()).toEqual('AbaloneMove(0, 0, DOWN_LEFT)');
        expect(doubleCoord.toString()).toEqual('AbaloneMove((0, 0) > (2, 0), DOWN)');
    });
    it('should equal correctly', () => {
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 0), HexaDirection.DOWN);
        const otherMove: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 0), HexaDirection.DOWN_LEFT);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(otherMove)).toBeFalse();
    });
    it('should throw when creating move with no HexaDirectionnal alignement', () => {
        const error: string = 'Invalid direction';
        expect(() => AbaloneMove.fromDoubleCoord(new Coord(0, 0), new Coord(1, 1), HexaDirection.UP))
            .toThrowError(error);
    });
    it('AbaloneMove.encoder should be correct', () => {
        const rules: AbaloneRules = new AbaloneRules(AbaloneGameState);
        const minimax: AbaloneDummyMinimax = new AbaloneDummyMinimax(rules, 'dummy');
        const firstTurnMoves: AbaloneMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            NumberEncoderTestUtils.expectToBeCorrect(AbaloneMove.encoder, move);
        }
    });
});
