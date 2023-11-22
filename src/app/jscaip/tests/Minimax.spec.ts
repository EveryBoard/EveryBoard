/* eslint-disable max-lines-per-function */
import { P4Heuristic } from 'src/app/games/p4/P4Heuristic';
import { P4Move } from 'src/app/games/p4/P4Move';
import { P4MoveGenerator } from 'src/app/games/p4/P4MoveGenerator';
import { P4Config, P4Node, P4Rules } from 'src/app/games/p4/P4Rules';
import { P4State } from 'src/app/games/p4/P4State';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { AIDepthLimitOptions } from '../AI';
import { BoardValue } from '../BoardValue';
import { MCTS } from '../MCTS';
import { DummyHeuristic, Minimax } from '../Minimax';

const config: P4Config = P4Rules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

describe('Minimax', () => {

    let moveGenerator: P4MoveGenerator;
    let heuristic: P4Heuristic;
    let minimax: Minimax<P4Move, P4State>;
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
        let node: P4Node = P4Rules.get().getInitialNode(config);
        minimax.chooseNextMove(node, minimaxOptions);
        const callsToGetBoardValueWithoutPruning: number = getBoardValueSpy.calls.count();
        getBoardValueSpy.calls.reset();
        const callsToGetListMovesWithoutPruning: number = getListMovesSpy.calls.count();
        getListMovesSpy.calls.reset();

        // When computing the same information with alpha-beta pruning enabled
        minimax.prune = true;
        node = new P4Node(P4Rules.get().getInitialState(config));
        minimax.chooseNextMove(node, minimaxOptions);
        const callsToGetBoardValueWithPruning: number = getBoardValueSpy.calls.count();
        const callsToGetListMovesWithPruning: number = getListMovesSpy.calls.count();

        // Then the number of calls is strictly lower
        expect(callsToGetBoardValueWithPruning).toBeLessThan(callsToGetBoardValueWithoutPruning);
        expect(callsToGetListMovesWithPruning).toBeLessThan(callsToGetListMovesWithoutPruning);
    });

    it('should compute the score of an already created node that has no score', () => {
        // Given a node that already has a child (but for which we haven't computed the board value)
        // This can happen when another AI has already created the node
        const node: P4Node = P4Rules.get().getInitialNode(config);
        const mcts: MCTS<P4Move, P4State> = new MCTS('MCTS', moveGenerator, P4Rules.get());
        mcts.chooseNextMove(node, { name: '100ms', maxSeconds: 0.1 });
        // When performing a minimax search
        minimax.chooseNextMove(node, minimaxOptions);
        // Then it should have computed the board value
        expect(node.getCache(minimax.name + '-score').isPresent()).toBeTrue();
    });

    it('should select randomly among best children when asked to do so', () => {
        spyOn(ArrayUtils, 'getRandomElement').and.callThrough();
        // Given a minimax that selects the best move randomly among all best children
        const node: P4Node = P4Rules.get().getInitialNode(config);
        minimax.random = true;
        // When computing the best children
        minimax.chooseNextMove(node, minimaxOptions);
        // Then it should have selected it randomly among all the best
        expect(ArrayUtils.getRandomElement).toHaveBeenCalled();
    });

    it('should not select randomly among best children when not asked to do so', () => {
        spyOn(ArrayUtils, 'getRandomElement').and.callThrough();
        // Given a minimax that selects the best move randomly among all best children
        const node: P4Node = P4Rules.get().getInitialNode(config);
        minimax.random = false;
        // When computing the best children
        minimax.chooseNextMove(node, minimaxOptions);
        // Then it should have selected it randomly among all the best
        expect(ArrayUtils.getRandomElement).not.toHaveBeenCalled();
    });

    it('should transmit config to its children', () => {
        // Given a mother node with a specific config
        const customConfig: P4Config = {
            ...config,
            height: 4,
        };
        const node: P4Node = P4Rules.get().getInitialNode(customConfig);

        // When creating the children
        const nextMove: P4Move = minimax.chooseNextMove(node, minimaxOptions);
        const child: P4Node = node.getChild(nextMove).get();

        // Then the children should have the same config
        expect(child.getConfig()).toBe(customConfig);

    });

});

describe('DummyHeuristic', () => {

    it('should assign a board value of 0', () => {
        // Given the dummy heuristic and a game node
        const heuristic: DummyHeuristic<P4Move, P4State> = new DummyHeuristic();
        const node: P4Node = P4Rules.get().getInitialNode(config);

        // When computing the node's value
        const boardValue: BoardValue = heuristic.getBoardValue(node);

        // Then it should be zero
        expect(boardValue.value).toBe(0);
    });

});
