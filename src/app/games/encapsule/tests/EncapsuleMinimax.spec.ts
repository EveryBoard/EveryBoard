import { Coord } from 'src/app/jscaip/Coord';
import { EncapsuleMinimax } from '../EncapsuleMinimax';
import { EncapsuleMove } from '../EncapsuleMove';
import { EncapsulePiece } from '../EncapsulePiece';
import { EncapsuleRules } from '../EncapsuleRules';
import { EncapsuleState } from '../EncapsuleState';

describe('EncapsuleMinimax', () => {

    const rules: EncapsuleRules = new EncapsuleRules(EncapsuleState);

    let minimax: EncapsuleMinimax;

    const drop: (piece: EncapsulePiece, coord: Coord) => boolean = (piece: EncapsulePiece, coord: Coord) => {
        const move: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
        return rules.choose(move);
    };
    beforeEach(() => {
        minimax = new EncapsuleMinimax(rules, 'Encapsule Minimax');
    });
    describe('getListMoves', () => {
        it('should have 27 moves on first turn', () => {
            // 3 pieces x 9 coords = 27 moves
            expect(minimax.getListMoves(rules.node).length).toBe(27);
        });
        it('should have XX moves on a specific third turn', () => {
            drop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
            drop(EncapsulePiece.SMALL_LIGHT, new Coord(1, 0));
            // Drops medium = 9, drops big = 9, drops small = 7
            // Moving the piece on board = 7 possible landing cases
            // Total: 32
            expect(minimax.getListMoves(rules.node).length).toBe(32);
        });
    });
});
