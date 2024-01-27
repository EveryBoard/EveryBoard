/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';
import { CoerceoState } from '../CoerceoState';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { CoerceoCapturesAndFreedomHeuristic } from '../CoerceoCapturesAndFreedomHeuristic';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { CoerceoRules } from '../CoerceoRules';

const _: FourStatePiece = FourStatePiece.EMPTY;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

describe('CoerceoCapturesAndFreedomHeuristic', () => {

    let heuristic: CoerceoCapturesAndFreedomHeuristic;
    const defaultConfig: NoConfig = CoerceoRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new CoerceoCapturesAndFreedomHeuristic();
    });

    it('should prefer a board with more freedom', () => {
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
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

});
