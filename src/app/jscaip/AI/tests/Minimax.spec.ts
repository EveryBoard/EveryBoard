/* eslint-disable max-lines-per-function */
import { P4Heuristic } from 'src/app/games/p4/P4Heuristic';
import { P4Move } from 'src/app/games/p4/P4Move';
import { P4MoveGenerator } from 'src/app/games/p4/P4MoveGenerator';
import { P4Config, P4Node, P4Rules } from 'src/app/games/p4/P4Rules';
import { P4State } from 'src/app/games/p4/P4State';
import { AIDepthLimitOptions } from '../AI';
import { BoardValue } from '../BoardValue';
import { MCTS } from '../MCTS';
import { DummyHeuristic, Minimax } from '../Minimax';
import { ArrayUtils, MGPOptional, Set } from '@everyboard/lib';
import { PlayerOrNone } from '../../Player';

const defaultConfig: MGPOptional<P4Config> = P4Rules.get().getDefaultRulesConfig();

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

    it('Minimax should prune when instructed to do so', () => {
        const getBoardValueSpy: jasmine.Spy = spyOn(heuristic, 'getBoardValue').and.callThrough();
        const getListMovesSpy: jasmine.Spy = spyOn(moveGenerator, 'getListMoves').and.callThrough();

        // Given the number of moves of a minimax without alpha-beta pruning
        minimax.prune = false;
        let node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        const callsToGetBoardValueWithoutPruning: number = getBoardValueSpy.calls.count();
        getBoardValueSpy.calls.reset();
        const callsToGetListMovesWithoutPruning: number = getListMovesSpy.calls.count();
        getListMovesSpy.calls.reset();

        // When computing the same information with alpha-beta pruning enabled
        minimax.prune = true;
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
        minimax.random = true;
        // When computing the best children
        minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        // Then it should have selected it randomly among all the best
        expect(ArrayUtils.getRandomElement).toHaveBeenCalled();
    });

    it('should not select randomly among best children when not asked to do so', () => {
        spyOn(ArrayUtils, 'getRandomElement').and.callThrough();
        // Given a minimax that selects the best move randomly among all best children
        const node: P4Node = P4Rules.get().getInitialNode(defaultConfig);
        minimax.random = false;
        // When computing the best children
        minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        // Then it should have selected it randomly among all the best
        expect(ArrayUtils.getRandomElement).not.toHaveBeenCalled();
    });

    it('should have getBestChildren return all children when all have the same value', () => {
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

        // When calling getBestChildren on it
        const bestChildrens: P4Node[] = minimax['getBestChildren'](
            node,
            possibleMoves,
            1,
            boardValue.toMinimum(),
            boardValue.toMaximum(),
            defaultConfig,
        );

        // Then all the choice should be best choices
        expect(bestChildrens.length).toBe(2);
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
