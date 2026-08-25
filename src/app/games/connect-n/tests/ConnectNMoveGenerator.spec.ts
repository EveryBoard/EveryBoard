/* eslint-disable max-lines-per-function */
import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { RectangularShape } from '../../../jscaip/shape/RectangularShape';
import { Shape } from '../../../jscaip/shape/Shape';
import { SimpleGameStateWithTable } from '../../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameState } from '../../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../../jscaip/state/TopologicGameStateWithTable';
import { SquareTopology } from '../../../jscaip/topology/SquareTopology';
import { Topology } from '../../../jscaip/topology/Topology';
import { ConnectNMove } from '../ConnectNMove';
import { ConnectNMoveGenerator } from '../ConnectNMoveGenerator';
import { ConnectNConfig, ConnectNNode, ConnectNRules } from '../ConnectNRules';

describe('ConnectNMoveGenerator', () => {

    let moveGenerator: ConnectNMoveGenerator;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;

    const defaultConfig: ConnectNConfig = ConnectNRules.get().getDefaultRulesConfig();
    const defaultTopology: Topology = new SquareTopology();
    const defaultShape: Shape = new RectangularShape(defaultConfig.boardSize, defaultConfig.boardSize, defaultTopology);

    beforeEach(() => {
        moveGenerator = new ConnectNMoveGenerator();
    });

    it('should propose only one move at first turn (square config)', () => {
        // Given the initial node
        const width: number = defaultConfig.boardSize;
        const height: number = defaultConfig.boardSize;
        const state: TopologicGameState<FourStatePiece> = ConnectNRules.get().getInitialState(defaultConfig);
        const node: ConnectNNode = new ConnectNNode(state);

        // When listing the moves
        const moves: ConnectNMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should only include the center of the board
        const cx: number = Math.floor(width/2);
        const cy: number = Math.floor(height/2);
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(ConnectNMove.of([new Coord(cx, cy)]));
    });

    it('should count all possible moves including only neighboring-coord', () => {
        // Given a board with 36 possibles combinations of immediate neighbors
        // With the firsts being neighbors of a piece on board
        const gameState: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable<FourStatePiece>(
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
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const node: ConnectNNode = new ConnectNNode(state);

        // When listing the moves
        const moves: ConnectNMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then the answer should be 36
        expect(moves.length).toBe(36);
    });

});
