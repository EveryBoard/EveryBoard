/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { EmptyRulesConfig } from '../../../config/RulesConfigUtil';
import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Player } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { Table } from '../../../jscaip/TableUtils';
import { GipfRules } from '../GipfRules';
import { GipfScoreHeuristic } from '../GipfScoreHeuristic';
import { GipfState } from '../GipfState';

const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

describe('GipfScoreHeuristic', () => {

    let heuristic: GipfScoreHeuristic;
    const defaultConfig: EmptyRulesConfig = GipfRules.get().getDefaultRulesConfig();

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
        const capturedPieces: PlayerNumberMap = PlayerNumberMap.of(0, 3);
        const moreCapturedPieces: PlayerNumberMap = PlayerNumberMap.of(0, 7);
        const weakState: GipfState = new GipfState(board, 0, PlayerNumberMap.of(5, 5), capturedPieces);
        const strongState: GipfState = new GipfState(board, 0, PlayerNumberMap.of(5, 5), moreCapturedPieces);
        // When computing their values
        // Then it should prefer having more captured pieces
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
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
        const piecesToPlay: PlayerNumberMap = PlayerNumberMap.of(5, 5);
        const morePiecesToPlay: PlayerNumberMap = PlayerNumberMap.of(5, 7);
        const weakState: GipfState = new GipfState(board, 0, piecesToPlay, PlayerNumberMap.of(0, 0));
        const strongState: GipfState = new GipfState(board, 0, morePiecesToPlay, PlayerNumberMap.of(0, 0));
        // When computing their minimax values
        // Then it should prefer having more pieces to place
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

});
