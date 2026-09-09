/* eslint-disable max-lines-per-function */
import { MGPOptional, Set } from '@everyboard/lib';

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
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { ConnectNAlignmentHeuristic } from '../ConnectNAlignmentHeuristic';
import { ConnectNMove } from '../ConnectNMove';
import { ConnectNMoveGenerator } from '../ConnectNMoveGenerator';
import { ConnectNConfig, ConnectNNode, ConnectNRules } from '../ConnectNRules';
import { HexagonalTopology } from '../../../jscaip/topology/HexagonalTopology';
import { HexagonalShape } from '../../../jscaip/shape/HexagonalShape';

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
    const defaultTopology: SquareTopology = new SquareTopology();
    const defaultConfig: ConnectNConfig = ConnectNRules.get().getDefaultRulesConfig();
    const defaultShape: Shape = new RectangularShape(defaultConfig.boardSize, defaultConfig.boardSize, defaultTopology);

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;

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
            ], 4);
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(0, 0), new Coord(1, 0)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));

        // When asking what is the best move
        const bestMove: ConnectNMove = minimax.chooseNextMove(node, level1, defaultConfig);

        // Then it should be that victory
        expect(bestMove).toEqual(ConnectNMove.of([new Coord(4, 0), new Coord(5, 0)]));
    });

    SlowTest.it('should block double-open four at level two', () => {
        // Given a minimax at level two
        // And a board where current opponent could win if current player does not block them (..XXXXX..)
        const gameState: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable<FourStatePiece>([
                [_, _, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
        const previousMove: ConnectNMove = new ConnectNMove(new Set([new Coord(2, 0), new Coord(3, 0)]));
        const node: ConnectNNode = new ConnectNNode(
            state,
            MGPOptional.empty(),
            MGPOptional.of(previousMove),
        );

        // When asking what is the best move
        const bestMove: ConnectNMove = minimax.chooseNextMove(node, level2, defaultConfig);

        // Then the minimax level two should block
        const possibleBlocks: Coord[][] = [
            [new Coord(0, 0), new Coord(1, 0)],
            [new Coord(1, 0), new Coord(6, 0)],
            [new Coord(6, 0), new Coord(7, 0)],
        ];
        const possibleMoves: Set<ConnectNMove> = new Set(
            possibleBlocks.map(
                (coords: Coord[]) => new ConnectNMove(new Set(coords)),
            ),
        );
        expect(possibleMoves.contains(bestMove))
            .withContext(`chosen move was supposed to be in ${ possibleMoves.map((m: ConnectNMove) => m.toString()) } but was ${ bestMove.toString() }`)
            .toBeTrue();
    });

    SlowTest.it('should block double-open five at level two', () => {
        // Given a minimax at level two
        // And a board where current opponent could win if current player does not block them (..XXXX..)
        const gameState: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable<FourStatePiece>([
                [_, _, O, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _],
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
            ], 2);
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const previousMove: ConnectNMove = new ConnectNMove(new Set([new Coord(2, 0), new Coord(3, 0)]));
        const node: ConnectNNode = new ConnectNNode(
            state,
            MGPOptional.empty(),
            MGPOptional.of(previousMove),
        );

        // When asking what is the best move
        const bestMove: ConnectNMove = minimax.chooseNextMove(node, level2, defaultConfig);

        // Then the minimax level two should block
        const left: boolean = bestMove.coords.contains(new Coord(1, 0));
        const right: boolean = bestMove.coords.contains(new Coord(7, 0));
        expect(left || right).toBeTrue();
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

    it('should start in the center with hexagonal config', () => {
        // Given the initial board and a hexagonal shape
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            shape: 'HEXAGONAL',
            boardSize: 5,
        };
        const state: TopologicGameState<FourStatePiece> = ConnectNRules.get().getInitialState(customConfig);
        const node: ConnectNNode = new ConnectNNode(state);

        // When asking and applying best move
        const bestMove: ConnectNMove = minimax.chooseNextMove(node, level1, customConfig);

        // Then it should be put in the middle
        expect(bestMove).toEqual(ConnectNMove.of([new Coord(4, 4)]));
    });

});
