/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { RectangularShape } from '../../../jscaip/shape/RectangularShape';
import { Shape } from '../../../jscaip/shape/Shape';
import { SimpleGameStateWithTable } from '../../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameState } from '../../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../../jscaip/state/TopologicGameStateWithTable';
import { SquareTopology } from '../../../jscaip/topology/SquareTopology';
import { Topology } from '../../../jscaip/topology/Topology';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { ConnectNAlignmentHeuristic } from '../ConnectNAlignmentHeuristic';
import { ConnectNMove } from '../ConnectNMove';
import { ConnectNMoveGenerator } from '../ConnectNMoveGenerator';
import { ConnectNConfig, ConnectNNode, ConnectNRules } from '../ConnectNRules';

class ConnectNAlignmentMinimax
    extends Minimax<ConnectNMove, TopologicGameState<FourStatePiece>, ConnectNConfig>
{

    public constructor() {
        super($localize`Alignment`,
              ConnectNRules.get(),
              new ConnectNAlignmentHeuristic(),
              new ConnectNMoveGenerator(),
        );
    }
}

describe('ConnectNAlignmentMinimax', () => {

    let minimax: Minimax<ConnectNMove, TopologicGameState<FourStatePiece>, ConnectNConfig>;
    const level1: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const level2: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };
    const defaultTopology: Topology = new SquareTopology();
    const defaultConfig: ConnectNConfig = ConnectNRules.get().getDefaultRulesConfig();
    const defaultShape: Shape = new RectangularShape(defaultConfig.boardSize, defaultConfig.boardSize, defaultTopology);

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;

    beforeEach(() => {
        minimax = new ConnectNAlignmentMinimax();
    });

    it('should do winning move when one is possible', () => {
        // Given a board where there is place for a victory of first player
        const gameState: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable<FourStatePiece>([
                [O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
            ], 3);
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const node: ConnectNNode = new ConnectNNode(state);

        // When asking what is the best move
        const bestMove: ConnectNMove = minimax.chooseNextMove(node, level1, defaultConfig);

        // Then it should be that victory
        expect(bestMove).toEqual(ConnectNMove.of([new Coord(4, 0), new Coord(5, 0)]));
    });

    SlowTest.it('should block double-open fives at level two', () => {
        // Given a minimax at level two
        // And a board where current opponent could win if current player does not block them (..XXXXX..)
        const gameState: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable<FourStatePiece>([
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
            ], 3);
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const node: ConnectNNode = new ConnectNNode(state);

        // When asking what is the best move
        const bestMove: ConnectNMove = minimax.chooseNextMove(node, level2, defaultConfig);

        // Then the minimax level two should block
        expect(bestMove).toEqual(ConnectNMove.of([new Coord(1, 18), new Coord(7, 18)]));
    });

    SlowTest.it('should block double-open four at level two', () => {
        // Given a minimax at level two
        // And a board where current opponent could win if current player does not block them (..XXXX..)
        const gameState: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable<FourStatePiece>([
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
                [_, _, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 2);
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const node: ConnectNNode = new ConnectNNode(state);

        // When asking what is the best move
        const bestMove: ConnectNMove = minimax.chooseNextMove(node, level2, defaultConfig);

        // Then the minimax level two should block
        expect(bestMove).toEqual(ConnectNMove.of([new Coord(1, 18), new Coord(6, 18)]));
    });

    SlowTest.it('should be able play against itself', () => {
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
        minimaxTest({
            rules: ConnectNRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a fast minimax, actually one of the slowest
        });
    });

});
