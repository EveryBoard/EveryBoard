import { Direction } from 'src/app/jscaip/Direction';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasMinimax } from '../EpaminondasMinimax';
import { EpaminondasMove } from '../EpaminondasMove';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('EpaminondasMove: ', () => {

    it('Should forbid out of range coords', () => {
        expect(() => new EpaminondasMove(-1, 0, 1, 1, Direction.DOWN_LEFT))
            .toThrowError('Illegal coord outside of board (-1, 0).');
        expect(() => new EpaminondasMove(0, 13, 1, 1, Direction.UP_RIGHT))
            .toThrowError('Illegal coord outside of board (0, 13).');
    });
    it('Should forbid invalid step size and number of selected piece', () => {
        expect(() => new EpaminondasMove(0, 0, 2, 3, Direction.UP))
            .toThrowError('Cannot move a phalanx further than its size (got step size 3 for 2 pieces).');
        expect(() => new EpaminondasMove(0, 0, -1, 0, Direction.UP))
            .toThrowError('Must select minimum one piece (got -1).');
        expect(() => new EpaminondasMove(2, 2, 1, 0, Direction.UP))
            .toThrowError('Step size must be minimum one (got 0).');
    });
    it('EpaminondasMove.encoder should be correct', () => {
        const rules: EpaminondasRules = new EpaminondasRules(EpaminondasState);
        const minimax: EpaminondasMinimax = new EpaminondasMinimax(rules, 'EpaminondasMinimax');
        const moves: EpaminondasMove[] = minimax.getListMoves(rules.node);
        for (const move of moves) {
            NumberEncoderTestUtils.expectToBeCorrect(EpaminondasMove.encoder, move);
        }
    });
    it('Should forbid non integer number to decode', () => {
        expect(() => EpaminondasMove.encoder.decode(0.5)).toThrowError('EncodedMove must be an integer.');
    });
    it('Should override correctly equals and toString', () => {
        const move: EpaminondasMove = new EpaminondasMove(4, 3, 2, 1, Direction.UP);
        const neighboor: EpaminondasMove = new EpaminondasMove(0, 0, 2, 1, Direction.UP);
        const twin: EpaminondasMove = new EpaminondasMove(4, 3, 2, 1, Direction.UP);
        const firstCousin: EpaminondasMove = new EpaminondasMove(4, 3, 1, 1, Direction.UP);
        const secondCousin: EpaminondasMove = new EpaminondasMove(4, 3, 2, 2, Direction.UP);
        const thirdCousin: EpaminondasMove = new EpaminondasMove(4, 3, 2, 1, Direction.LEFT);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighboor)).toBeFalse();
        expect(move.equals(firstCousin)).toBeFalse();
        expect(move.equals(secondCousin)).toBeFalse();
        expect(move.equals(thirdCousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();
        expect(move.toString()).toBe('EpaminondasMove((4, 3), m:2, s:1, UP)');
    });
});
