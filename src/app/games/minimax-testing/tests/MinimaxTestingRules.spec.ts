import { MinimaxTestingNode, MinimaxTestingRules } from '../MinimaxTestingRules';
import { MinimaxTestingState } from '../MinimaxTestingState';
import { MinimaxTestingMove } from '../MinimaxTestingMove';
import { MinimaxTestingMinimax } from '../MinimaxTestingMinimax';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { expectToBeOngoing, expectToBeVictoryFor } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPNode } from 'src/app/jscaip/MGPNode';

describe('MinimaxTestingRules', () => {

    let rules: MinimaxTestingRules;
    let minimax: MinimaxTestingMinimax;

    beforeEach(() => {
        rules = new MinimaxTestingRules(MinimaxTestingState);
        minimax = new MinimaxTestingMinimax(rules, 'MinimaxTesting');
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('should be a victory of second player', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
        expect(rules.choose(MinimaxTestingMove.RIGHT)).toBeTrue();
        expect(minimax.getBoardValue(rules.node).value)
            .toEqual(Player.ONE.getVictoryValue());
    });
    it('IA should avoid loosing 4 move in a row', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
        let bestMove: MinimaxTestingMove;
        for (let i: number = 1; i < 5; i++) {
            bestMove = rules.node.findBestMove(1, minimax);
            rules.choose(bestMove);
            const value: number = minimax.getBoardValue(rules.node).value;
            expect(value).toEqual(i);
        }
    });
    xit('should not create sister-node to winning-node', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
        const bestMove: MinimaxTestingMove = rules.node.findBestMove(5, minimax);
        expect(bestMove).toEqual(MinimaxTestingMove.DOWN);
        expect(rules.node.getHopedValue(minimax)).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.node.countDescendants()).toEqual(10);
    });
    it('IA(depth=1) should create exactly 2 child at each turn before reaching the border', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_0;
        const initialNode: MinimaxTestingNode = rules.node;
        let bestMove: MinimaxTestingMove;
        for (let i: number = 1; i <= 3; i++) {
            bestMove = rules.node.findBestMove(1, minimax);
            rules.choose(bestMove);
        }
        expect(initialNode.countDescendants()).toEqual(6);
    });
    it('Minimax should prune', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_0;
        const initialNode: MinimaxTestingNode = rules.node;
        spyOn(minimax, 'getBoardValue').and.callThrough();
        spyOn(minimax, 'getListMoves').and.callThrough();

        rules.node.findBestMove(3, minimax);

        expect(minimax.getBoardValue).toHaveBeenCalledTimes(11); // should be 14 without pruning
        expect(initialNode.countDescendants()).toBe(11); // should be 14 without pruning as well
        expect(minimax.getListMoves).toHaveBeenCalledTimes(6); // should be 7 without pruning

        expect(initialNode.getHopedValue(minimax)).toBe(3);
    });
    it('Should not go further than the end game', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_0;
        const initialNode: MinimaxTestingNode = rules.node;
        spyOn(minimax, 'getBoardValue').and.callThrough();
        spyOn(minimax, 'getListMoves').and.callThrough();

        rules.node.findBestMove(7, minimax);

        expect(minimax.getBoardValue).toHaveBeenCalledTimes(30); // should be 68 times without pruning
        expect(initialNode.countDescendants()).toBe(30); // should be 68 without pruning
        expect(minimax.getListMoves).toHaveBeenCalledTimes(24); // should be 69 without pruning
    });
    describe('Should choose the first one to minimise calculation when all choice are the same value', () => {
        it('depth = 1', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_2;
            const bestMove: MinimaxTestingMove = rules.node.findBestMove(1, minimax, false);
            expect(bestMove).toEqual(minimax.getListMoves(rules.node)[0]);
            expect(rules.node.countDescendants()).toEqual(2);
        });
        it('depth = 2', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_3;
            spyOn(minimax, 'getListMoves').and.callThrough();
            const bestMove: MinimaxTestingMove = rules.node.findBestMove(2, minimax, false);
            expect(bestMove).toEqual(minimax.getListMoves(rules.node)[0]);
            expect(rules.node.countDescendants()).toEqual(3);
            expect(minimax.getListMoves).toHaveBeenCalledTimes(3);
        });
    });
    it('should refuse to go right when on the extreme right', () => {
        // Given a board where you are on the right
        const state: MinimaxTestingState = new MinimaxTestingState(3, new Coord(3, 0));

        // when attempting to go right
        const move: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
        const status: LegalityStatus = rules.isLegal(move, state);

        // should refuse
        expect(status.legal.reason).toBe('incorrect move');
    });
    it('should refuse to go down when on the bottom', () => {
        // Given a board where you are on the right
        const state: MinimaxTestingState = new MinimaxTestingState(3, new Coord(0, 3));

        // when attempting to go right
        const move: MinimaxTestingMove = MinimaxTestingMove.DOWN;
        const status: LegalityStatus = rules.isLegal(move, state);

        // should refuse
        expect(status.legal.reason).toBe('incorrect move');
    });
    describe('GameStatus', () => {
        it('should recognize victory when on the player victory value (Player.ONE)', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
            const state: MinimaxTestingState = new MinimaxTestingState(1, new Coord(1, 0));

            const node: MinimaxTestingNode = new MGPNode(null, null, state);
            expectToBeVictoryFor(rules, node, Player.ONE, [minimax]);
        });
        it('should recognize victory when on the player victory value (Player.ZERO)', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
            const state: MinimaxTestingState = new MinimaxTestingState(2, new Coord(0, 2));

            const node: MinimaxTestingNode = new MGPNode(null, null, state);
            expectToBeVictoryFor(rules, node, Player.ZERO, [minimax]);
        });
        it('should recognize ongoing part', () => {
            const state: MinimaxTestingState = new MinimaxTestingState(2, new Coord(0, 0));

            const node: MinimaxTestingNode = new MGPNode(null, null, state);
            expectToBeOngoing(rules, node, [minimax]);
        });
        it('should recognize victory when part is over and score is positive (Player.ZERO)', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
            const state: MinimaxTestingState = new MinimaxTestingState(6, new Coord(3, 3));

            const node: MinimaxTestingNode = new MGPNode(null, null, state);
            expectToBeVictoryFor(rules, node, Player.ZERO, [minimax]);
        });
        it('should recognize victory when part is over and score is positive (Player.ONE)', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_4;
            const state: MinimaxTestingState = new MinimaxTestingState(6, new Coord(3, 3));

            const node: MinimaxTestingNode = new MGPNode(null, null, state);
            expectToBeVictoryFor(rules, node, Player.ONE, [minimax]);
        });
    });
});
