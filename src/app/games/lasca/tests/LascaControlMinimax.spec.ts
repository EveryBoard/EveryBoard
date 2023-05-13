/* eslint-disable max-lines-per-function */
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LascaControlMinimax } from '../LascaControlMinimax';
import { LascaMove } from '../LascaMove';
import { LascaNode } from '../LascaRules';
import { LascaPiece, LascaStack, LascaState } from '../LascaState';

describe('LascaControlMinimax', () => {

    const u: LascaStack = new LascaStack([LascaPiece.ZERO]);
    const v: LascaStack = new LascaStack([LascaPiece.ONE]);
    const _: LascaStack = LascaStack.EMPTY;
    let minimax: LascaControlMinimax;

    beforeEach(() => {
        minimax = new LascaControlMinimax('Lasca Control Minimax');
    });
    it('should return full list of captures when capture must be done', () => {
        // Given a state where current player should capture
        const state: LascaState = LascaState.from([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, v, _, _, _, _],
            [_, u, _, u, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, u, _],
            [_, _, _, _, _, _, _],
        ], 1);
        const node: LascaNode = new MGPNode(state);

        // When asking it a list of move for this state
        const moves: LascaMove[] = minimax.getListMoves(node);

        // Then it should return the list of capture
        expect(moves.length).toBe(2);
    });
    it('should return full list of steps when no capture must be done', () => {
        // Given a state where only steps can be made
        const state: LascaState = LascaState.getInitialState();
        const node: LascaNode = new MGPNode(state);

        // When asking it a list of move for that state
        const moves: LascaMove[] = minimax.getListMoves(node);

        // Then it should return the list of steps
        expect(moves.length).toBe(6);
    });
    it('should not count the immobilized stacks', () => {
        // Given two boards with the exact same stacks, one having blocked stacks
        const immobilizedState: LascaState = LascaState.from([
            [v, _, _, _, _, _, _],
            [_, u, _, _, _, _, _],
            [_, _, u, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0);
        const mobileState: LascaState = LascaState.from([
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
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           immobilizedState,
                                                           MGPOptional.empty(),
                                                           mobileState,
                                                           MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('should count the potential mobility as primary board value', () => {
        // Given two boards with the same stacks, one with an unique forced capture, the other without
        const forcedState: LascaState = LascaState.from([
            [v, _, _, _, _, _, _],
            [_, u, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0); // O has 1 stack, X has 2
        const freeState: LascaState = LascaState.from([
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
        RulesUtils.expectStatesToBeOfEqualValue(minimax, forcedState, freeState);
    });
});
