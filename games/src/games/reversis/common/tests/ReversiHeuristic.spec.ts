/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../../jscaip/AI/tests/HeuristicUtils.spec';
import { FourStatePiece } from '../../../../jscaip/FourStatePiece';
import { Player } from '../../../../jscaip/Player';
import { Table } from '../../../../jscaip/TableUtils';
import { RectangularBoardShape } from '../../../../jscaip/board-shape/RectangularBoardShape';
import { Direction } from '../../../../jscaip/direction/Direction';
import { EightDirection } from '../../../../jscaip/direction/EightDirection';
import { GameStateWithTable } from '../../../../jscaip/state/GameStateWithTable';
import { EightDirectionSquareTopology } from '../../../../jscaip/topology/EightDirectionSquareTopology';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ReversiConfig, ReversiNode } from '../AbstractReversiRules';
import { ReversiHeuristic } from '../ReversiHeuristic';
import { ReversiState } from '../ReversiState';

const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const defaultConfig: ReversiConfig = ReversiRules.get().getDefaultRulesConfig();
const ordinalTopology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
const squareShape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(8, 8, ordinalTopology);

describe('ReversiHeuristic', () => {

    let heuristic: ReversiHeuristic;

    beforeEach(() => {
        heuristic = new ReversiHeuristic(ReversiRules.get());
    });

    it('should get 16 points for corner', () => {
        const board: Table<FourStatePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, X, O, _, _, _],
            [_, _, _, O, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X],
        ];
        const gameState: GameStateWithTable<FourStatePiece> = new GameStateWithTable(board, 1);
        const state: ReversiState<Direction> = new ReversiState(ordinalTopology, squareShape, gameState);
        const node: ReversiNode = new ReversiNode(state);
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;
        expect(boardValue).toEqual([16]);
    });

    it('should get 8 points for edges', () => {
        const board: Table<FourStatePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, X, O, _, _, _],
            [_, _, _, O, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, _],
        ];
        const gameState: GameStateWithTable<FourStatePiece> = new GameStateWithTable(board, 1);
        const state: ReversiState<Direction> = new ReversiState(ordinalTopology, squareShape, gameState);
        const node: ReversiNode = new ReversiNode(state);
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;
        expect(boardValue).toEqual([8]);
    });

    it('should get 1 points for normal square', () => {
        const board: Table<FourStatePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, X, O, _, _, _],
            [_, _, _, O, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, X, _],
            [_, _, _, _, _, _, _, _],
        ];
        const gameState: GameStateWithTable<FourStatePiece> = new GameStateWithTable(board, 1);
        const state: ReversiState<Direction> = new ReversiState(ordinalTopology, squareShape, gameState);
        const node: ReversiNode = new ReversiNode(state);
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;
        expect(boardValue).toEqual([1]);
    });

    it('should prefer owning the corners', () => {
        // Given two boards where we control the corner in one, and not in the other
        const weakerBoard: Table<FourStatePiece> = [
            [_, X, O, _, _, _, _, _],
            [_, _, O, _, _, _, _, _],
            [_, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const weakerGameState: GameStateWithTable<FourStatePiece> = new GameStateWithTable(weakerBoard, 2);
        const weakerState: ReversiState<Direction> = new ReversiState(ordinalTopology, squareShape, weakerGameState);
        const strongerBoard: Table<FourStatePiece> = [
            [O, O, O, _, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const strongerGameState: GameStateWithTable<FourStatePiece> = new GameStateWithTable(strongerBoard, 2);
        const strongerState: ReversiState<Direction> = new ReversiState(ordinalTopology, squareShape, strongerGameState);

        // When computing the board value
        // Then the control of the corner should be preferred
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(
            heuristic,
            weakerState,
            MGPOptional.empty(),
            strongerState,
            MGPOptional.empty(),
            Player.ZERO,
            defaultConfig,
        );
    });

});
