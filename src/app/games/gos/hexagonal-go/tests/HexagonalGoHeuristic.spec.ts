/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Player } from '../../../../jscaip/Player';
import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { Table } from '../../../../jscaip/TableUtils';
import { GoPhase } from '../../GoPhase';
import { GoPiece } from '../../GoPiece';
import { GoState } from '../../GoState';
import { HexagonalGoHeuristic } from '../HexagonalGoHeuristic';
import { HexagonalGoConfig, HexagonalGoRules } from '../HexagonalGoRules';

const X: GoPiece = GoPiece.LIGHT;
const k: GoPiece = GoPiece.DEAD_LIGHT;
const O: GoPiece = GoPiece.DARK;
const _: GoPiece = GoPiece.EMPTY;
const N: GoPiece = GoPiece.UNREACHABLE;

describe('HexagonalGoHeuristic', () => {

    let heuristic: HexagonalGoHeuristic;
    const defaultConfig: MGPOptional<HexagonalGoConfig> = HexagonalGoRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new HexagonalGoHeuristic();
    });

    it('should prefer a larger territory', () => {
        // Given a board with more territory for Player.ZERO than for Player.ONE
        const strongBoard: Table<GoPiece> = [
            [N, N, N, N, N, N, O, X, _, _, _, _, _],
            [N, N, N, N, N, _, O, X, _, _, _, _, _],
            [N, N, N, N, _, _, O, X, _, _, _, _, _],
            [N, N, N, _, _, _, O, X, _, _, _, _, _],
            [N, N, _, _, _, _, O, X, _, _, _, _, _],
            [N, _, _, _, _, _, O, X, _, _, _, _, _],
            [_, _, _, _, _, _, O, X, _, _, _, _, _],
            [_, _, _, _, _, _, O, X, _, _, _, _, N],
            [_, _, _, _, _, _, O, X, _, _, _, N, N],
            [_, _, _, _, _, _, O, X, _, _, N, N, N],
            [_, _, _, _, _, _, O, X, _, N, N, N, N],
            [_, _, _, _, _, _, O, X, N, N, N, N, N],
            [_, _, _, _, _, _, O, N, N, N, N, N, N],
        ];
        const strongState: GoState =
            new GoState(strongBoard, PlayerNumberMap.of(10, 1), 0, MGPOptional.empty(), GoPhase.PLAYING);
        const weakBoard: Table<GoPiece> = [
            [N, N, N, N, N, N, X, O, _, _, _, _, _],
            [N, N, N, N, N, _, X, O, _, _, _, _, _],
            [N, N, N, N, _, _, X, O, _, _, _, _, _],
            [N, N, N, _, _, _, X, O, _, _, _, _, _],
            [N, N, _, _, _, _, X, O, _, _, _, _, _],
            [N, _, _, _, _, _, X, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, O, _, _, _, _, N],
            [_, _, _, _, _, _, X, O, _, _, _, N, N],
            [_, _, _, _, _, _, X, O, _, _, N, N, N],
            [_, _, _, _, _, _, X, O, _, N, N, N, N],
            [_, _, _, _, _, _, X, O, N, N, N, N, N],
            [_, _, _, _, _, _, X, N, N, N, N, N, N],
        ];
        const weakState: GoState =
            new GoState(weakBoard, PlayerNumberMap.of(10, 1), 0, MGPOptional.empty(), GoPhase.PLAYING);

        // When computing their value
        // Then it should prefer having a larger territory
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO,
                                                               defaultConfig);
    });

    it('should count killed piece as two points', () => {
        // Given two boards with the same territory, but one with a dead opponent piece
        const strongBoard: Table<GoPiece> = [
            [N, N, N, N, N, N, X, O, _, _, _, O, k],
            [N, N, N, N, N, _, X, O, _, _, _, O, O],
            [N, N, N, N, _, _, X, O, _, _, _, _, _],
            [N, N, N, _, _, _, X, O, _, _, _, _, _],
            [N, N, _, _, _, _, X, O, _, _, _, _, _],
            [N, _, _, _, _, _, X, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, O, _, _, _, _, N],
            [_, _, _, _, _, _, X, O, _, _, _, N, N],
            [_, _, _, _, _, _, X, O, _, _, N, N, N],
            [_, _, _, _, _, _, X, O, _, N, N, N, N],
            [_, _, _, _, _, _, X, O, N, N, N, N, N],
            [_, _, _, _, _, _, X, N, N, N, N, N, N],
        ];
        const strongState: GoState =
            new GoState(strongBoard, PlayerNumberMap.of(10, 1), 0, MGPOptional.empty(), GoPhase.PLAYING);
        const weakBoard: Table<GoPiece> = [
            [N, N, N, N, N, N, X, O, _, _, _, O, _],
            [N, N, N, N, N, _, X, O, _, _, _, O, _],
            [N, N, N, N, _, _, X, O, _, _, _, _, _],
            [N, N, N, _, _, _, X, O, _, _, _, _, _],
            [N, N, _, _, _, _, X, O, _, _, _, _, _],
            [N, _, _, _, _, _, X, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, O, _, _, _, _, N],
            [_, _, _, _, _, _, X, O, _, _, _, N, N],
            [_, _, _, _, _, _, X, O, _, _, N, N, N],
            [_, _, _, _, _, _, X, O, _, N, N, N, N],
            [_, _, _, _, _, _, X, O, N, N, N, N, N],
            [_, _, _, _, _, _, X, N, N, N, N, N, N],
        ];
        const weakState: GoState =
            new GoState(weakBoard, PlayerNumberMap.of(10, 1), 0, MGPOptional.empty(), GoPhase.PLAYING);
        // When computing their value
        // Then it should assign the same value for both
        HeuristicUtils.expectStatesToBeOfEqualValue(heuristic, weakState, strongState, defaultConfig);
    });

});
