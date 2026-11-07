/* eslint-disable max-lines-per-function */
import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Direction } from '../../../jscaip/direction/Direction';
import { RectangularShape } from '../../../jscaip/shape/RectangularShape';
import { TopologicShape } from '../../../jscaip/shape/TopologicShape';
import { GameStateWithTable } from '../../../jscaip/state/GameStateWithTable';
import { TopologicGameState } from '../../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../../jscaip/state/TopologicGameStateWithTable';
import { EightDirectionSquareTopology } from '../../../jscaip/topology/EightDirectionSquareTopology';
import { ConnectSixMove } from '../ConnectSixMove';
import { ConnectSixMoveGenerator } from '../ConnectSixMoveGenerator';
import { ConnectSixConfig, ConnectSixNode, ConnectSixRules } from '../ConnectSixRules';

describe('ConnectSixMoveGenerator', () => {

    let moveGenerator: ConnectSixMoveGenerator;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;

    const defaultConfig: ConnectSixConfig = ConnectSixRules.get().getDefaultRulesConfig();
    const defaultTopology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
    const defaultShape: TopologicShape<Direction> = new RectangularShape(
        defaultConfig.boardSize,
        defaultConfig.boardSize,
        defaultTopology,
    );
    beforeEach(() => {
        moveGenerator = new ConnectSixMoveGenerator();
    });

    it('should propose only one move at first turn (square config)', () => {
        // Given the initial node
        const width: number = defaultConfig.boardSize;
        const height: number = defaultConfig.boardSize;
        const state: TopologicGameState<FourStatePiece, Direction> = ConnectSixRules.get().getInitialState(defaultConfig);
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When listing the moves
        const moves: ConnectSixMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should only include the center of the board
        const cx: number = Math.floor(width/2);
        const cy: number = Math.floor(height/2);
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(ConnectSixMove.of([new Coord(cx, cy)]));
    });

    it('should count all possible moves including only neighboring-coord', () => {
        // Given a board with 36 possibles combinations of immediate neighbors
        // With the firsts being neighbors of a piece on board
        const gameState: GameStateWithTable<FourStatePiece> =
            new GameStateWithTable<FourStatePiece>(
                [
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, O, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _],
                ],
                3,
            );
        const state: TopologicGameState<FourStatePiece, Direction> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When listing the moves
        const moves: ConnectSixMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then the answer should be 65
        expect(moves.length).toBe(65);
    });

});
