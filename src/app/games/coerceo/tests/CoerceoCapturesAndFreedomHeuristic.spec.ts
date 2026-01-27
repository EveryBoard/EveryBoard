/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { Table } from '../../../jscaip/TableUtils';
import { CoerceoState } from '../CoerceoState';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Player } from '../../../jscaip/Player';
import { CoerceoCapturesAndFreedomHeuristic } from '../CoerceoCapturesAndFreedomHeuristic';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { CoerceoConfig, CoerceoRules } from '../CoerceoRules';
import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';

const _: FourStatePiece = FourStatePiece.EMPTY;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

describe('CoerceoCapturesAndFreedomHeuristic', () => {

    let heuristic: CoerceoCapturesAndFreedomHeuristic;
    const defaultConfig: MGPOptional<CoerceoConfig> = CoerceoRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new CoerceoCapturesAndFreedomHeuristic();
    });

    it('should prefer a board with more freedom', () => {
        // Given a board with less freedom for Player.ONE, and one with more
        const weakBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, X, O, N, N, N, N, N, N],
        ];
        const weakState: CoerceoState =
            new CoerceoState(weakBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const strongBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, X, O, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
        ];
        const strongState: CoerceoState =
            new CoerceoState(strongBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        // When comparing them
        // Then the one with more freedom should be considered better for Player.ONE
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

});
