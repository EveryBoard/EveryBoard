/* eslint-disable max-lines-per-function */
import { MGPOptional, Set } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Direction } from '../../../jscaip/direction/Direction';
import { RectangularShape } from '../../../jscaip/shape/RectangularShape';
import { TopologicShape } from '../../../jscaip/shape/TopologicShape';
import { GameStateWithTable } from '../../../jscaip/state/GameStateWithTable';
import { TopologicGameState } from '../../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../../jscaip/state/TopologicGameStateWithTable';
import { EightDirectionSquareTopology } from '../../../jscaip/topology/EightDirectionSquareTopology';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { ConnectSixAlignmentHeuristic } from '../ConnectSixAlignmentHeuristic';
import { ConnectSixMove } from '../ConnectSixMove';
import { ConnectSixMoveGenerator } from '../ConnectSixMoveGenerator';
import { ConnectSixConfig, ConnectSixNode, ConnectSixRules } from '../ConnectSixRules';
class ConnectSixAlignmentMinimax
    extends Minimax<ConnectSixMove, TopologicGameState<FourStatePiece, Direction>, ConnectSixConfig>
{

    public constructor() {
        super($localize`Alignment`,
              ConnectSixRules.get(),
              new ConnectSixAlignmentHeuristic(),
              new ConnectSixMoveGenerator(),
        );
    }
}


describe('ConnectSixAlignmentMinimax', () => {

    let minimax: Minimax<ConnectSixMove, TopologicGameState<FourStatePiece, Direction>, ConnectSixConfig>;
    const level1: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const level2: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };
    const defaultTopology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
    const defaultConfig: ConnectSixConfig = ConnectSixRules.get().getDefaultRulesConfig();
    const defaultShape: TopologicShape<Direction> = new RectangularShape(
        defaultConfig.boardSize,
        defaultConfig.boardSize,
        defaultTopology,
    );
    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;

    beforeEach(() => {
        minimax = new ConnectSixAlignmentMinimax();
    });

    it('should do winning move when one is possible', () => {
        // Given a board where there is place for a victory of first player
        const gameState: GameStateWithTable<FourStatePiece> =
            new GameStateWithTable<FourStatePiece>([
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
        const state: TopologicGameState<FourStatePiece, Direction> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const move: ConnectSixMove =
            ConnectSixMove.of([new Coord(0, 0), new Coord(1, 0)]);
        const previousNode: ConnectSixNode = new ConnectSixNode(state);
        const node: ConnectSixNode =
            new ConnectSixNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));

        // When asking what is the best move
        const bestMove: ConnectSixMove = minimax.chooseNextMove(node, level1, defaultConfig);

        // Then it should be that victory
        expect(bestMove).toEqual(ConnectSixMove.of([new Coord(4, 0), new Coord(5, 0)]));
    });

    SlowTest.it('should block double-open four at level two', () => {
        // Given a minimax at level two
        // And a board where current opponent could win if current player does not block them (..XXXXX..)
        const gameState: GameStateWithTable<FourStatePiece> =
            new GameStateWithTable<FourStatePiece>([
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
        const state: TopologicGameState<FourStatePiece, Direction> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const previousMove: ConnectSixMove = new ConnectSixMove(new Set([new Coord(2, 0), new Coord(3, 0)]));
        const node: ConnectSixNode = new ConnectSixNode(
            state,
            MGPOptional.empty(),
            MGPOptional.of(previousMove),
        );

        // When asking what is the best move
        const bestMove: ConnectSixMove = minimax.chooseNextMove(node, level2, defaultConfig);

        // Then the minimax level two should block
        const possibleBlocks: Coord[][] = [
            [new Coord(0, 0), new Coord(1, 0)],
            [new Coord(1, 0), new Coord(6, 0)],
            [new Coord(6, 0), new Coord(7, 0)],
        ];
        const possibleMoves: Set<ConnectSixMove> = new Set(
            possibleBlocks.map(
                (coords: Coord[]) => new ConnectSixMove(new Set(coords)),
            ),
        );
        expect(possibleMoves.contains(bestMove))
            .withContext(`chosen move was supposed to be in ${ possibleMoves.map((m: ConnectSixMove) => m.toString()) } but was ${ bestMove.toString() }`)
            .toBeTrue();
    });

    SlowTest.it('should block double-open five at level two', () => {
        // Given a minimax at level two
        // And a board where current opponent could win if current player does not block them (..XXXX..)
        const gameState: GameStateWithTable<FourStatePiece> =
            new GameStateWithTable<FourStatePiece>([
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
        const state: TopologicGameState<FourStatePiece, Direction> = new TopologicGameStateWithTable(
            defaultTopology,
            defaultShape,
            gameState,
        );
        const previousMove: ConnectSixMove = new ConnectSixMove(new Set([new Coord(2, 0), new Coord(3, 0)]));
        const node: ConnectSixNode = new ConnectSixNode(
            state,
            MGPOptional.empty(),
            MGPOptional.of(previousMove),
        );

        // When asking what is the best move
        const bestMove: ConnectSixMove = minimax.chooseNextMove(node, level2, defaultConfig);

        // Then the minimax level two should block
        const left: boolean = bestMove.coords.contains(new Coord(1, 0));
        const right: boolean = bestMove.coords.contains(new Coord(7, 0));
        expect(left || right).toBeTrue();
    });

    SlowTest.it('should be able play against itself', () => {
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
        minimaxTest({
            rules: ConnectSixRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a fast minimax, actually one of the slowest
        });
    });

    it('should start in the center with hexagonal config', () => {
        // Given the initial board and a hexagonal shape
        const customConfig: ConnectSixConfig = {
            ...defaultConfig,
            shape: 'HEXAGONAL',
            boardSize: 5,
        };
        const state: TopologicGameState<FourStatePiece, Direction> = ConnectSixRules.get().getInitialState(customConfig);
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When asking and applying best move
        const bestMove: ConnectSixMove = minimax.chooseNextMove(node, level1, customConfig);

        // Then it should be put in the middle
        expect(bestMove).toEqual(ConnectSixMove.of([new Coord(4, 4)]));
    });

});
