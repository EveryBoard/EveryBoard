/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaNode, SaharaRules } from '../SaharaRules';
import { SaharaMinimax } from '../SaharaMinimax';
import { SaharaMove } from '../SaharaMove';
import { SaharaState } from '../SaharaState';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { SaharaFailure } from '../SaharaFailure';

describe('SaharaRules', () => {

    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;

    let rules: SaharaRules;
    let minimaxes: SaharaMinimax[];

    beforeEach(() => {
        rules = SaharaRules.get();
        minimaxes = [
            new SaharaMinimax(rules, 'SaharaMinimax'),
        ];
    });
    it('SaharaRules should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('TriangularCheckerBoard should always give 3 neighbors', () => {
        for (let y: number = 0; y < SaharaState.HEIGHT; y++) {
            for (let x: number = 0; x < SaharaState.WIDTH; x++) {
                expect(TriangularCheckerBoard.getNeighbors(new Coord(x, y)).length).toBe(3);
            }
        }
    });
    it('Bouncing on occupied space should be illegal', () => {
        // Given a board where two piece are neigbhoor
        const state: SaharaState = SaharaState.getInitialState();

        // When trying to rebounce on occupied piece
        const move: SaharaMove = SaharaMove.from(new Coord(7, 0), new Coord(8, 1)).get();

        // Then it should be illegal
        const reason: string = SaharaFailure.CAN_ONLY_REBOUND_ON_EMPTY_SPACE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should forbid moving opponent piece', () => {
        const state: SaharaState = SaharaState.getInitialState();
        const move: SaharaMove = SaharaMove.from(new Coord(3, 0), new Coord(4, 0)).get();
        const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should see that Player.ONE won', () => {
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
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
});
