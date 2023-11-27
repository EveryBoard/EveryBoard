/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { GipfState } from '../GipfState';
import { GipfScoreHeuristic } from '../GipfScoreHeuristic';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/jscaip/TableUtils';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { Player } from 'src/app/jscaip/Player';

const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

describe('GipfScoreHeuristic', () => {

    let heuristic: GipfScoreHeuristic;

    beforeEach(() => {
        heuristic = new GipfScoreHeuristic();
    });
    it('should favor having captured pieces', () => {
        // Given a state with more captured pieces than another
        const board: Table<FourStatePiece> = [
            [N, N, N, _, O, _, _],
            [N, N, _, _, O, _, _],
            [N, _, _, _, _, O, _],
            [O, X, O, _, X, _, _],
            [O, _, _, O, X, X, N],
            [X, _, X, _, _, N, N],
            [_, X, _, _, N, N, N],
        ];
        const capturedPieces: [number, number] = [0, 3];
        const moreCapturedPieces: [number, number] = [0, 7];
        const weakState: GipfState = new GipfState(board, 0, [5, 5], capturedPieces);
        const strongState: GipfState = new GipfState(board, 0, [5, 5], moreCapturedPieces);
        // When computing their values
        // Then it should prefer having more captured pieces
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE);
    });
    it('should favor having pieces to play pieces', () => {
        // Given two states differing only in available pieces to place
        const board: Table<FourStatePiece> = [
            [N, N, N, _, O, _, _],
            [N, N, _, _, O, _, _],
            [N, _, _, _, _, O, _],
            [O, X, O, _, X, _, _],
            [O, _, _, O, X, X, N],
            [X, _, X, _, _, N, N],
            [_, X, _, _, N, N, N],
        ];
        const piecesToPlay: [number, number] = [5, 5];
        const morePiecesToPlay: [number, number] = [5, 7];
        const weakState: GipfState = new GipfState(board, 0, piecesToPlay, [0, 0]);
        const strongState: GipfState = new GipfState(board, 0, morePiecesToPlay, [0, 0]);
        // When computing their minimax values
        // Then it should prefer having more pieces to place
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE);
    });
});
