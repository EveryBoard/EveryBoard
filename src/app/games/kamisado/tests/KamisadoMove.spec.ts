/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { KamisadoState } from '../KamisadoState';
import { KamisadoRules } from '../KamisadoRules';
import { KamisadoMinimax } from '../KamisadoMinimax';
import { KamisadoMove } from '../KamisadoMove';
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('KamisadoMove', () => {

    it('should toString in a readable way', () => {
        expect((KamisadoMove.of(new Coord(0, 0), new Coord(1, 5))).toString()).toEqual('KamisadoMove((0, 0)->(1, 5))');
        expect(KamisadoMove.PASS.toString()).toEqual('KamisadoMove(PASS)');
    });
    it('should have a bijective encoder', () => {
        const rules: KamisadoRules = new KamisadoRules(KamisadoState);
        const minimax: KamisadoMinimax = new KamisadoMinimax(rules, 'KamisadoMinimax');
        const moves: KamisadoMove[] = minimax.getListMoves(rules.node);
        moves.push(KamisadoMove.PASS);
        for (const move of moves) {
            NumberEncoderTestUtils.expectToBeBijective(KamisadoMove.encoder, move);
        }
    });
    it('should force move to start and end inside the board', () => {
        expect(() => KamisadoMove.of(new Coord(-1, 2), new Coord(2, 2))).toThrowError();
        expect(() => KamisadoMove.of(new Coord(0, 0), new Coord(-1, -1))).toThrowError();
        expect(() => KamisadoMove.of(new Coord(0, 0), new Coord(9, 9))).toThrowError();
        expect(() => KamisadoMove.of(new Coord(8, 5), new Coord(5, 5))).toThrowError();
    });
    it('should override equals correctly', () => {
        const move: KamisadoMove = KamisadoMove.of(new Coord(2, 2), new Coord(3, 3));
        const sameMove: KamisadoMove = KamisadoMove.of(new Coord(2, 2), new Coord(3, 3));
        const neighbor: KamisadoMove = KamisadoMove.of(new Coord(3, 3), new Coord(2, 2));
        const stranger: KamisadoMove = KamisadoMove.of(new Coord(5, 5), new Coord(6, 5));
        const pass: KamisadoMove = KamisadoMove.PASS;
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(sameMove)).toBeTrue();
        expect(move.equals(neighbor)).toBeFalse();
        expect(move.equals(stranger)).toBeFalse();
        expect(move.equals(pass)).toBeFalse();
        expect(pass.equals(move)).toBeFalse();
    });
    it('should assign a length of 0 to PASS moves', () => {
        expect(KamisadoMove.PASS.length()).toBe(0);
    });
});
