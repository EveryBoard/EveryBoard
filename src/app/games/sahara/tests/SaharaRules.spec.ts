import { Coord } from 'src/app/jscaip/Coord';
import { SaharaNode, SaharaRules } from '../SaharaRules';
import { SaharaMinimax } from '../SaharaMinimax';
import { SaharaMove } from '../SaharaMove';
import { SaharaPartSlice } from '../SaharaPartSlice';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { MGPSet } from 'src/app/utils/MGPSet';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { expectToBeVictoryFor } from 'src/app/jscaip/tests/Rules.spec';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

describe('SaharaRules', () => {

    const N: number = FourStatePiece.NONE.value;
    const O: number = FourStatePiece.ZERO.value;
    const X: number = FourStatePiece.ONE.value;
    const _: number = FourStatePiece.EMPTY.value;

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
            .withContext('Just moved black piece should be in her landing spot')
            .toBe(FourStatePiece.ZERO.value);
        expect(rules.node.gamePartSlice.getBoardAt(new Coord(0, 3)))
            .withContext('Just moved black piece should have left her initial spot')
            .toBe(FourStatePiece.EMPTY.value);
        expect(rules.choose(new SaharaMove(new Coord(3, 0), new Coord(4, 0)))).toBeTrue();
        expect(rules.choose(new SaharaMove(new Coord(1, 4), new Coord(2, 4)))).toBeTrue();
        expect(rules.node.getOwnValue(minimax).value).toBe(Number.MIN_SAFE_INTEGER, 'Should be victory');
    });
    it('Bouncing on occupied case should be illegal', () => {
        expect(rules.choose(new SaharaMove(new Coord(7, 0), new Coord(8, 1)))).toBeFalse();
    });
    it('Should forbid moving ennemy piece', () => {
        const state: SaharaPartSlice = SaharaPartSlice.getInitialSlice();
        const move: SaharaMove = new SaharaMove(new Coord(3, 0), new Coord(4, 0));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toEqual(RulesFailure.CANNOT_CHOOSE_ENEMY_PIECE);
    });
    it('Should see that Player.ONE won', () => {
        const board: number[][] = [
            [N, N, O, _, _, _, X, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ];
        const state: SaharaPartSlice = new SaharaPartSlice(board, 4);
        const node: SaharaNode = new MGPNode(null, null, state);
        expectToBeVictoryFor(rules, node, Player.ONE, [new SaharaMinimax(rules, '')]);
    });
});
