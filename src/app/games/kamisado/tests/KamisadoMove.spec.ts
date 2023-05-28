/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { KamisadoNode, KamisadoRules } from '../KamisadoRules';
import { KamisadoMinimax } from '../KamisadoMinimax';
import { KamisadoMove } from '../KamisadoMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('KamisadoMove', () => {

    it('should toString in a readable way', () => {
        expect(KamisadoMove.from(new Coord(0, 0), new Coord(1, 5)).get().toString()).toEqual('KamisadoMove((0, 0)->(1, 5))');
        expect(KamisadoMove.PASS.toString()).toEqual('KamisadoMove(PASS)');
    });
    it('should have a bijective encoder', () => {
        const rules: KamisadoRules = KamisadoRules.get();
        const minimax: KamisadoMinimax = new KamisadoMinimax(rules, 'KamisadoMinimax');
        const node: KamisadoNode = rules.getInitialNode();
        const moves: KamisadoMove[] = minimax.getListMoves(node);
        moves.push(KamisadoMove.PASS);
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(KamisadoMove.encoder, move);
        }
    });
    it('should force move to start and end inside the board', () => {
        expect(() => KamisadoMove.from(new Coord(-1, 2), new Coord(2, 2))).toThrowError();
        expect(() => KamisadoMove.from(new Coord(0, 0), new Coord(-1, -1))).toThrowError();
        expect(() => KamisadoMove.from(new Coord(0, 0), new Coord(9, 9))).toThrowError();
        expect(() => KamisadoMove.from(new Coord(8, 5), new Coord(5, 5))).toThrowError();
    });
    it('should override equals correctly', () => {
        const move: KamisadoMove = KamisadoMove.from(new Coord(2, 2), new Coord(3, 3)).get();
        const sameMove: KamisadoMove = KamisadoMove.from(new Coord(2, 2), new Coord(3, 3)).get();
        const neighbor: KamisadoMove = KamisadoMove.from(new Coord(3, 3), new Coord(2, 2)).get();
        const stranger: KamisadoMove = KamisadoMove.from(new Coord(5, 5), new Coord(6, 5)).get();
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
