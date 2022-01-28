/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaNode, SaharaRules } from '../SaharaRules';
import { SaharaMinimax } from '../SaharaMinimax';
import { SaharaMove } from '../SaharaMove';
import { SaharaState } from '../SaharaState';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { MGPSet } from 'src/app/utils/MGPSet';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

describe('SaharaRules', () => {

    const N: FourStatePiece = FourStatePiece.NONE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;

    let rules: SaharaRules;
    let minimax: SaharaMinimax;

    beforeEach(() => {
        rules = new SaharaRules(SaharaState);
        minimax = new SaharaMinimax(rules, 'SaharaMinimax');
    });
    it('SaharaRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).withContext('Game should start a turn 0').toBe(0);
        const moves: SaharaMove[] = minimax.getListMoves(rules.node);
        const expectedMoves: MGPSet<SaharaMove> = new MGPSet([
            SaharaMove.from(new Coord( 2, 0), new Coord(2, 1)).get(),
            SaharaMove.from(new Coord( 7, 0), new Coord(6, 0)).get(),
            SaharaMove.from(new Coord( 7, 0), new Coord(5, 0)).get(),
            SaharaMove.from(new Coord( 7, 0), new Coord(6, 1)).get(),
            SaharaMove.from(new Coord(10, 2), new Coord(9, 2)).get(),
            SaharaMove.from(new Coord( 0, 3), new Coord(1, 3)).get(),
            SaharaMove.from(new Coord( 0, 3), new Coord(2, 3)).get(),
            SaharaMove.from(new Coord( 0, 3), new Coord(1, 4)).get(),
            SaharaMove.from(new Coord( 3, 5), new Coord(4, 5)).get(),
            SaharaMove.from(new Coord( 8, 5), new Coord(8, 4)).get(),
            SaharaMove.from(new Coord( 8, 5), new Coord(7, 4)).get(),
            SaharaMove.from(new Coord( 8, 5), new Coord(9, 4)).get(),
        ]);
        expect(new MGPSet(moves).equals(expectedMoves)).toBeTrue();
        expect(moves.length).toBe(12);
    });
    it('TriangularCheckerBoard should always give 3 neighbors', () => {
        for (let y: number = 0; y < SaharaState.HEIGHT; y++) {
            for (let x: number = 0; x < SaharaState.WIDTH; x++) {
                expect(TriangularCheckerBoard.getNeighbors(new Coord(x, y)).length).toBe(3);
            }
        }
    });
    it('Shortest victory simulation', () => {
        expect(rules.choose(SaharaMove.from(new Coord(0, 3), new Coord(1, 4)).get())).toBeTrue();
        expect(rules.node.gameState.getPieceAt(new Coord(1, 4)))
            .withContext('Just moved black piece should be in her landing spot')
            .toBe(FourStatePiece.ZERO);
        expect(rules.node.gameState.getPieceAt(new Coord(0, 3)))
            .withContext('Just moved black piece should have left her initial spot')
            .toBe(FourStatePiece.EMPTY);
        expect(rules.choose(SaharaMove.from(new Coord(3, 0), new Coord(4, 0)).get())).toBeTrue();
        expect(rules.choose(SaharaMove.from(new Coord(1, 4), new Coord(2, 4)).get())).toBeTrue();
        expect(rules.node.getOwnValue(minimax).value).withContext('Should be victory').toBe(Number.MIN_SAFE_INTEGER);
    });
    it('Bouncing on occupied space should be illegal', () => {
        expect(rules.choose(SaharaMove.from(new Coord(7, 0), new Coord(8, 1)).get())).toBeFalse();
    });
    it('Should forbid moving opponent piece', () => {
        const state: SaharaState = SaharaState.getInitialState();
        const move: SaharaMove = SaharaMove.from(new Coord(3, 0), new Coord(4, 0)).get();
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    });
    it('Should see that Player.ONE won', () => {
        const board: FourStatePiece[][] = [
            [N, N, O, _, _, _, X, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ];
        const state: SaharaState = new SaharaState(board, 4);
        const node: SaharaNode = new SaharaNode(state);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, [new SaharaMinimax(rules, '')]);
    });
});
