/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LascaControlHeuristic, LascaControlMinimax, LascaMoveGenerator } from '../LascaControlMinimax';
import { LascaMove } from '../LascaMove';
import { LascaNode } from '../LascaRules';
import { LascaPiece, LascaStack, LascaState } from '../LascaState';

const u: LascaStack = new LascaStack([LascaPiece.ZERO]);
const v: LascaStack = new LascaStack([LascaPiece.ONE]);
const _: LascaStack = LascaStack.EMPTY;

describe('LascaControlMoveGenerator', () => {

    let moveGenerator: LascaMoveGenerator;

    beforeEach(() => {
        moveGenerator = new LascaMoveGenerator();
    });
    it('should return full list of captures when capture must be done', () => {
        // Given a state where current player should capture
        const state: LascaState = LascaState.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, v, _, _, _, _],
            [_, u, _, u, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, u, _],
            [_, _, _, _, _, _, _],
        ], 1);
        const node: LascaNode = new LascaNode(state);

        // When asking it a list of move for this state
        const moves: LascaMove[] = moveGenerator.getListMoves(node);

        // Then it should return the list of capture
        expect(moves.length).toBe(2);
    });
    it('should return full list of steps when no capture must be done', () => {
        // Given a state where only steps can be made
        const state: LascaState = LascaState.getInitialState();
        const node: LascaNode = new LascaNode(state);

        // When asking it a list of move for that state
        const moves: LascaMove[] = moveGenerator.getListMoves(node);

        // Then it should return the list of steps
        expect(moves.length).toBe(6);
    });
});

describe('LascaControlHeuristic', () => {

    let heuristic: LascaControlHeuristic;

    beforeEach(() => {
        heuristic = new LascaControlHeuristic();
    });
    it('should not count the immobilized stacks', () => {
        // Given two boards with the exact same stacks, one having blocked stacks
        const immobilizedState: LascaState = LascaState.of([
            [v, _, _, _, _, _, _],
            [_, u, _, _, _, _, _],
            [_, _, u, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0);
        const mobileState: LascaState = LascaState.of([
            [v, _, _, _, _, _, _],
            [_, _, _, u, _, _, _],
            [_, _, u, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0);

        // When comparing them
        // Then the one with mobile stacks should be considered better
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               immobilizedState,
                                                               MGPOptional.empty(),
                                                               mobileState,
                                                               MGPOptional.empty(),
                                                               Player.ONE);
    });
    it('should count the potential mobility as primary board value', () => {
        // Given two boards with the same stacks, one with an unique forced capture, the other without
        const forcedState: LascaState = LascaState.of([
            [v, _, _, _, _, _, _],
            [_, u, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0); // O has 1 stack, X has 2
        const freeState: LascaState = LascaState.of([
            [v, _, _, _, _, _, _],
            [_, _, _, u, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0); // O has 1 stack, X has 2

        // When comparing them
        // Then the two should be of equal value:
        //     the number of non-blocked stacks times the number of piece (which is 11)
        HeuristicUtils.expectStatesToBeOfEqualValue(heuristic, forcedState, freeState);
    });
});

describe('LascaControlMinimax', () => {
    it('should create', () => {
        expect(new LascaControlMinimax()).toBeTruthy();
    });
});
