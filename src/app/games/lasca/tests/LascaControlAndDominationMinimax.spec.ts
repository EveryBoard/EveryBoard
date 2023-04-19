/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LascaControlAndDominationMinimax } from '../LascaControlAndDomination';
import { LascaPiece, LascaStack, LascaState } from '../LascaState';

describe('LascaControlAndDominateMinimax', () => {

    const O: LascaStack = new LascaStack([LascaPiece.ZERO]);
    const X: LascaStack = new LascaStack([LascaPiece.ONE]);
    const _: LascaStack = LascaStack.EMPTY;
    let minimax: LascaControlAndDominationMinimax;

    beforeEach(() => {
        minimax = new LascaControlAndDominationMinimax();
    });
    it('should not count the immobilized stacks', () => {
        // Given two boards with the exact same stacks, one having blocked stacks
        const immobilizedState: LascaState = LascaState.from([
            [X, _, _, _, _, _, _],
            [_, O, _, _, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, X, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0);
        const mobileState: LascaState = LascaState.from([
            [X, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, X, _, _],
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
            [X, _, _, _, _, _, _],
            [_, O, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, X, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0); // O has 1 stack, X has 2
        const freeState: LascaState = LascaState.from([
            [X, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, X, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0); // O has 1 stack, X has 2

        // When comparing them
        // Then the two should be of equal value:
        //     the number of non-blocked stacks times the number of piece (which is 11)
        RulesUtils.expectStatesToBeOfEqualValue(minimax, forcedState, freeState);
    });
    it('should count the dominating piece as secondary board value (at equal potential mobility)', () => {
        // Given two boards with the same potential mobility, one with more "dominant pieces" than the other
        // (dominant = that is of the same color as the commander)
        const d: LascaStack = new LascaStack([LascaPiece.ONE, LascaPiece.ZERO, LascaPiece.ZERO]);
        const dominatedState: LascaState = LascaState.from([
            [d, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0);
        const D: LascaStack = new LascaStack([LascaPiece.ONE, LascaPiece.ONE, LascaPiece.ONE]);
        const dominatingState: LascaState = LascaState.from([
            [D, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0);

        // When comparing them
        // Then the one with more dominant pieces should be prefered
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           dominatedState,
                                                           MGPOptional.empty(),
                                                           dominatingState,
                                                           MGPOptional.empty(),
                                                           Player.ONE);
    });
});