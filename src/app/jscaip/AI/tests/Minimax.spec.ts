/* eslint-disable max-lines-per-function */
import { ArrayUtils, MGPOptional, Set } from '@everyboard/lib';

import { P4Heuristic } from '../../../games/p4/P4Heuristic';
import { P4Move } from '../../../games/p4/P4Move';
import { P4MoveGenerator } from '../../../games/p4/P4MoveGenerator';
import { P4Config, P4Node, P4Rules } from '../../../games/p4/P4Rules';
import { P4State } from '../../../games/p4/P4State';
import { PlayerOrNone } from '../../Player';
import { AIDepthLimitOptions, AITimeLimitOptions } from '../AI';
import { BoardValue } from '../BoardValue';
import { DummyHeuristic } from '../DummyHeuristic';
import { IterativeDeepeningMinimax } from '../IterativeDeepeningMinimax';
import { MCTS } from '../MCTS';
import { Minimax } from '../Minimax';

const defaultConfig: P4Config = P4Rules.get().getDefaultRulesConfig();

describe('Minimax', () => {

    let moveGenerator: P4MoveGenerator;
    let heuristic: P4Heuristic;
    let minimax: Minimax<P4Move, P4State, P4Config>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 3', maxDepth: 3 };

    beforeEach(() => {
        moveGenerator = new P4MoveGenerator();
        heuristic = new P4Heuristic();
        minimax = new Minimax('Dummy', P4Rules.get(), heuristic, moveGenerator);
    });

    it('should be convertible to a string', () => {
        expect(minimax.toString()).toEqual('Dummy');
    });

    it('Minimax should prune when instructed to do so', () => {
        const getBoardValueSpy: jasmine.Spy = spyOn(heuristic, 'getBoardValue').and.callThrough();
        const getListMovesSpy: jasmine.Spy = spyOn(moveGenerator, 'getListMoves').and.callThrough();

        // Given the number of moves of a minimax without alpha-beta pruning
        minimax['prune'] = false;
        let node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        const callsToGetBoardValueWithoutPruning: number = getBoardValueSpy.calls.count();
        getBoardValueSpy.calls.reset();
        const callsToGetListMovesWithoutPruning: number = getListMovesSpy.calls.count();
        getListMovesSpy.calls.reset();

        // When computing the same information with alpha-beta pruning enabled
        minimax['prune'] = true;
        node = new P4Node(P4Rules.get().getInitialState(defaultConfig));
        minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        const callsToGetBoardValueWithPruning: number = getBoardValueSpy.calls.count();
        const callsToGetListMovesWithPruning: number = getListMovesSpy.calls.count();

        // Then the number of calls is strictly lower
        expect(callsToGetBoardValueWithPruning).toBeLessThan(callsToGetBoardValueWithoutPruning);
        expect(callsToGetListMovesWithPruning).toBeLessThan(callsToGetListMovesWithoutPruning);
    });

    it('should compute the score of an already created node that has no score', () => {
        // Given a node that already has a child (but for which we haven't computed the board value)
        // This can happen when another AI has already created the node
        const node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        const mcts: MCTS<P4Move, P4State, P4Config> = new MCTS('MCTS', moveGenerator, P4Rules.get());
        mcts.chooseNextMove(node, { name: '100ms', maxSeconds: 0.1 }, defaultConfig);
        // When performing a minimax search
        minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        // Then it should have computed the board value
        expect(node.getCache(minimax.name + '-score').isPresent()).toBeTrue();
    });

    it('should select randomly among best children when asked to do so', () => {
        spyOn(ArrayUtils, 'getRandomElement').and.callThrough();
        // Given a minimax that selects the best move randomly among all best children
        const node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        minimax['useRandomness'] = true;
        // When computing the best children
        minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        // Then it should have selected it randomly among all the best
        expect(ArrayUtils.getRandomElement).toHaveBeenCalled();
    });

    it('should not select randomly among best children when not asked to do so', () => {
        spyOn(ArrayUtils, 'getRandomElement').and.callThrough();
        // Given a minimax that selects the best move randomly among all best children
        const node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        minimax['useRandomness'] = false;
        // When computing the best children
        minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        // Then it should have selected it randomly among all the best
        expect(ArrayUtils.getRandomElement).not.toHaveBeenCalled();
    });

    it('should run iterative deepening minimax', () => {
        // Given an iterative deepening minimax
        const iterativeDeepening: IterativeDeepeningMinimax<P4Move, P4State, P4Config> =
            new IterativeDeepeningMinimax('ID Dummy', P4Rules.get(), heuristic, moveGenerator);
        iterativeDeepening['useRandomness'] = true;
        iterativeDeepening['prune'] = false;
        iterativeDeepening['useTranspositionTables'] = false;
        const node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        const options: AITimeLimitOptions = { name: '50ms', maxSeconds: 0.05 };

        // When selecting a move through iterative deepening
        const move: P4Move = iterativeDeepening.chooseNextMove(node, options, defaultConfig);

        // Then it should select a legal move and expose time-based options
        expect(move).toBeDefined();
        expect(iterativeDeepening.name).toBe('ID Dummy');
        expect(iterativeDeepening.availableOptions[0]).toEqual({ name: '1 seconds', maxSeconds: 1 });
    });

    it('should stop iterative deepening when a deeper search is complete', () => {
        // Given an iterative deepening minimax that completes depth 1 and has nothing more to search at depth 2
        const iterativeDeepening: IterativeDeepeningMinimax<P4Move, P4State, P4Config> =
            new IterativeDeepeningMinimax('ID Dummy', P4Rules.get(), heuristic, moveGenerator);
        const node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        const expectedMove: P4Move = P4Move.of(3);
        spyOn(iterativeDeepening as unknown as { alphaBeta: () => MGPOptional<unknown> }, 'alphaBeta').and.returnValues(
            MGPOptional.of({ move: expectedMove, score: BoardValue.of(0), complete: true }),
            MGPOptional.empty(),
        );

        // When selecting a move through iterative deepening
        const move: P4Move =
            iterativeDeepening.chooseNextMove(node, { name: '1 second', maxSeconds: 1 }, defaultConfig);

        // Then it should keep the completed result from the previous depth
        expect(move).toBe(expectedMove);
    });

    it('should support a custom hash function', () => {
        // Given a minimax with a custom hash
        const customHash: Minimax<P4Move, P4State, P4Config> =
            new Minimax('Custom Hash', P4Rules.get(), heuristic, moveGenerator, (_state: P4State) => 'custom');

        // When hashing a state
        const hash: string = customHash['hash'](P4Rules.get().getInitialState(defaultConfig));

        // Then it should use the injected hash function
        expect(hash).toBe('custom');
    });

    it('should reuse lower and upper transposition bounds', () => {
        // Given a minimax with cached lower and upper bound entries
        const node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        const bestMove: P4Move = P4Move.of(3);
        const table: Map<string, unknown> = minimax['transpositionTable'];
        const key: string = minimax['hash'](node.gameState);
        table.set(key, { depth: 2, score: BoardValue.of(0), bound: 'LOWER', bestMove });

        // When searching with a lower bound that closes the window
        const lowerResult: MGPOptional<{ move: P4Move }> =
            minimax['alphaBeta'](node, 2, BoardValue.of(0), BoardValue.of(0), defaultConfig);

        // Then the cached move should be reused
        expect(lowerResult.get().move).toBe(bestMove);

        // Given an upper bound that closes the window
        table.set(key, { depth: 2, score: BoardValue.of(0), bound: 'UPPER', bestMove });

        // When searching again
        const upperResult: MGPOptional<{ move: P4Move }> =
            minimax['alphaBeta'](node, 2, BoardValue.of(0), BoardValue.of(0), defaultConfig);

        // Then the cached move should be reused
        expect(upperResult.get().move).toBe(bestMove);
    });

    it('should order known transposition-table best moves first', () => {
        // Given a minimax with a cached best move that is too shallow to reuse directly
        const node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        const bestMove: P4Move = P4Move.of(3);
        const table: Map<string, unknown> = minimax['transpositionTable'];
        table.set(minimax['hash'](node.gameState), {
            depth: 1,
            score: BoardValue.of(0),
            bound: 'EXACT',
            bestMove,
        });

        // When searching deeper
        const result: MGPOptional<{ move: P4Move }> =
            minimax['alphaBeta'](node, 2, BoardValue.of(0).toMinimum(), BoardValue.of(0).toMaximum(), defaultConfig);

        // Then the search should accept the cached move as a valid ordering hint
        expect(result.isPresent()).toBeTrue();
    });


    describe('getBestMove', () => {
        it('should have return all moves when all have the same value', () => {
            // Given any node with equivalent moves
            const _: PlayerOrNone = PlayerOrNone.NONE;
            const O: PlayerOrNone = PlayerOrNone.ZERO;
            const X: PlayerOrNone = PlayerOrNone.ONE;
            const symetricState: P4State = new P4State([
                [_, _, _, X, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, X, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, X, _, _, _],
                [_, _, _, O, _, _, _],
            ], 6);
            const node: P4Node = new P4Node(symetricState);
            const possibleMoves: Set<P4Move> = new Set([P4Move.of(0), P4Move.of(6)]);
            const boardValue: BoardValue = BoardValue.ofSingle(0, 0);

            // When calling getBestMove on it
            const result: { bestMoves: { move: P4Move, score: BoardValue }[], complete: boolean } = minimax['getBestMoves'](
                node,
                possibleMoves,
                1,
                boardValue.toMinimum(),
                boardValue.toMaximum(),
                defaultConfig,
            );

            // Then all the choice should be best choices
            expect(result.bestMoves.length).toBe(2);
            expect(result.complete).toBeTrue();
        });
    });

});

describe('DummyHeuristic', () => {

    it('should assign a board value of 0', () => {
        // Given the dummy heuristic and a game node
        const heuristic: DummyHeuristic<P4Move, P4State, P4Config> = new DummyHeuristic();
        const node: P4Node = P4Rules.get().getInitialNode(defaultConfig);

        // When computing the node's value
        const boardValue: BoardValue = heuristic.getBoardValue(node, defaultConfig);

        // Then it should be zero
        expect(boardValue.metrics).toEqual([0]);
    });

});
