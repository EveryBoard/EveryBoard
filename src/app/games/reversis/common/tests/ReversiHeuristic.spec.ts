/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../../jscaip/AI/tests/HeuristicUtils.spec';
import { FourStatePiece } from '../../../../jscaip/FourStatePiece';
import { Ordinal } from '../../../../jscaip/Ordinal';
import { Player } from '../../../../jscaip/Player';
import { Table } from '../../../../jscaip/TableUtils';
import { RectangularShape } from '../../../../jscaip/shape/RectangularShape';
import { SimpleGameStateWithTable } from '../../../../jscaip/state/SimpleGameStateWithTable';
import { OrdinalSquareTopology } from '../../../../jscaip/topology/OrdinalSquareTopology';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ReversiConfig, ReversiNode } from '../AbstractReversiRules';
import { ReversiHeuristic } from '../ReversiHeuristic';
import { ReversiState } from '../ReversiState';

const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const defaultConfig: ReversiConfig = ReversiRules.get().getDefaultRulesConfig();
const ordinalTopology: OrdinalSquareTopology = new OrdinalSquareTopology();
const squareShape: RectangularShape<Ordinal> = new RectangularShape(8, 8, ordinalTopology);

fdescribe('ReversiHeuristic', () => {

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
        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
        const state: ReversiState = new ReversiState(ordinalTopology, squareShape, gameState);
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
        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
        const state: ReversiState = new ReversiState(ordinalTopology, squareShape, gameState);
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
        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
        const state: ReversiState = new ReversiState(ordinalTopology, squareShape, gameState);
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
        const weakerGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(weakerBoard, 2);
        const weakerState: ReversiState = new ReversiState(ordinalTopology, squareShape, weakerGameState);
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
        const strongerGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(strongerBoard, 2);
        const strongerState: ReversiState = new ReversiState(ordinalTopology, squareShape, strongerGameState);
        // When computing the board value
        // Then the control of the corner should be preferred
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.empty(),
                                                               strongerState, MGPOptional.empty(),
                                                               Player.ZERO,
                                                               defaultConfig);
    });

});
