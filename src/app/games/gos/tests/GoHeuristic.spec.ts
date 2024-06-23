/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/jscaip/TableUtils';
import { MGPOptional } from '@everyboard/lib';
import { GoState } from '../GoState';
import { GoPhase } from '../go/GoPhase';
import { GoPiece } from '../GoPiece';
import { GoConfig, GoNode, AbstractGoRules } from '../AbstractGoRules';
import { GoHeuristic } from '../GoHeuristic';
import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

const X: GoPiece = GoPiece.LIGHT;
const O: GoPiece = GoPiece.DARK;
const _: GoPiece = GoPiece.EMPTY;

fdescribe('GoHeuristic', () => {

    let heuristic: GoHeuristic;
    const defaultConfig: MGPOptional<GoConfig> = AbstractGoRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new GoHeuristic();
    });

    xit('should getBoardValue according considering alive group who control alone one territory and not considering alive the others', () => {
        const board: Table<GoPiece> = [
            [_, X, _, _, _],
            [X, X, _, _, _],
            [_, X, _, O, O],
            [O, X, _, O, _],
            [_, X, _, O, _],
        ];
        const state: GoState = new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING);
        const initialNode: GoNode = new GoNode(state);
        const boardValue: readonly number[] = heuristic.getBoardValue(initialNode, defaultConfig).metrics;
        expect(boardValue).toEqual([3]);
    });

    it('should prefer a larger territory', () => {
        // Given a board with more territory for ZERO than another
        const strongBoard: Table<GoPiece> = [
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
        ];
        const strongState: GoState =
            new GoState(strongBoard, PlayerNumberMap.of(10, 1), 0, MGPOptional.empty(), GoPhase.PLAYING);
        const weakBoard: Table<GoPiece> = [
            [_, O, X, _, _],
            [_, O, X, _, _],
            [_, O, X, _, _],
            [_, O, X, _, _],
            [_, O, X, _, _],
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
        const u: GoPiece = GoPiece.DEAD_DARK;
        // Given two boards with the same territory, but one with a dead opponent piece
        const strongBoard: Table<GoPiece> = [
            [_, _, O, X, u],
            [_, _, O, X, X],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
        ];
        const strongState: GoState =
            new GoState(strongBoard, PlayerNumberMap.of(10, 1), 0, MGPOptional.empty(), GoPhase.PLAYING);
        const weakBoard: Table<GoPiece> = [
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
        ];
        const weakState: GoState =
            new GoState(weakBoard, PlayerNumberMap.of(10, 1), 0, MGPOptional.empty(), GoPhase.PLAYING);
        // When computing their value
        // Then it should assign the same value for both
        HeuristicUtils.expectStatesToBeOfEqualValue(heuristic, weakState, strongState, defaultConfig);
    });

});
