import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { AbaloneDummyMinimax } from '../AbaloneDummyMinimax';
import { AbaloneState } from '../AbaloneState';
import { AbaloneMove } from '../AbaloneMove';
import { AbaloneRules } from '../AbaloneRules';

describe('AbaloneMove', () => {

    it('should not construct a move with more than three piece', () => {
        expect(AbaloneMove.fromDoubleCoord(new Coord(0, 0),
                                           new Coord(3, 0),
                                           HexaDirection.DOWN))
            .toEqual(MGPFallible.failure('Distance between first coord and last coord is too great'));
    });
    it('should not construct when created with an out of range coord', () => {
        const coord: Coord = new Coord(9, 9);
        expect(AbaloneMove.fromSingleCoord(coord, HexaDirection.DOWN)).toEqual(MGPFallible.failure('Coord ' + coord.toString() + ' out of range, invalid move!'));
    });
    it('should map false double coord to single coord', () => {
        const up: Coord = new Coord(0, 0);
        const down: Coord = new Coord(0, 2);
        const distortedMove: AbaloneMove = AbaloneMove.fromDoubleCoord(up, down, HexaDirection.DOWN).get();
        const secondDistortedMove: AbaloneMove = AbaloneMove.fromDoubleCoord(down, up, HexaDirection.DOWN).get();
        const simpleMove: AbaloneMove = AbaloneMove.fromSingleCoord(up, HexaDirection.DOWN).get();
        expect(simpleMove.equals(distortedMove)).toBeTrue();
        expect(simpleMove.equals(secondDistortedMove)).toBeTrue();

        const distortedMove2: AbaloneMove = AbaloneMove.fromDoubleCoord(up, down, HexaDirection.UP).get();
        const simpleMove2: AbaloneMove = AbaloneMove.fromSingleCoord(down, HexaDirection.UP).get();
        expect(simpleMove2.equals(distortedMove2)).toBeTrue();
    });
    it('should spot identical translations and map them', () => {
        const up: Coord = new Coord(0, 0);
        const down: Coord = new Coord(0, 2);
        const normalMove: AbaloneMove = AbaloneMove.fromDoubleCoord(up, down, HexaDirection.LEFT).get();
        const distoredMove: AbaloneMove = AbaloneMove.fromDoubleCoord(down, up, HexaDirection.LEFT).get();
        expect(distoredMove.equals(normalMove)).toBeTrue();
    });
    it('should stringify nicely', () => {
        const singleCoord: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 0), HexaDirection.DOWN_LEFT).get();
        const doubleCoord: AbaloneMove = AbaloneMove.fromDoubleCoord(new Coord(0, 0),
                                                                     new Coord(2, 0),
                                                                     HexaDirection.DOWN).get();
        expect(singleCoord.toString()).toEqual('AbaloneMove(0, 0, DOWN_LEFT)');
        expect(doubleCoord.toString()).toEqual('AbaloneMove((0, 0) > (2, 0), DOWN)');
    });
    it('should equal correctly', () => {
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 0), HexaDirection.DOWN).get();
        const otherMove: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 0), HexaDirection.DOWN_LEFT).get();
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(otherMove)).toBeFalse();
    });
    it('should not construct when creating move with no HexaDirectionnal alignement', () => {
        expect(AbaloneMove.fromDoubleCoord(new Coord(0, 0), new Coord(1, 1), HexaDirection.UP))
            .toEqual(MGPFallible.failure('Invalid direction'));
    });
    it('AbaloneMove.encoder should be correct', () => {
        const rules: AbaloneRules = new AbaloneRules(AbaloneState);
        const minimax: AbaloneDummyMinimax = new AbaloneDummyMinimax(rules, 'dummy');
        const firstTurnMoves: AbaloneMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            NumberEncoderTestUtils.expectToBeCorrect(AbaloneMove.encoder, move);
        }
    });
});
