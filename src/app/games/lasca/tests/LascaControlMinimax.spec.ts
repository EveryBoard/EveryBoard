/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LascaControlMinimax } from '../LascaControlMinimax';
import { LascaRules } from '../LascaRules';
import { LascaPiece, LascaSpace, LascaState } from '../LascaState';

fdescribe('LascaControlAndDominateMinimax', () => {

    const O: LascaSpace = new LascaSpace([LascaPiece.ZERO]);
    const X: LascaSpace = new LascaSpace([LascaPiece.ONE]);
    const _: LascaSpace = LascaSpace.EMPTY;
    let minimax: LascaControlMinimax;

    beforeEach(() => {
        const ruler: LascaRules = LascaRules.get();
        minimax = new LascaControlMinimax(ruler, 'Lasca Control And Dominate Minimax');
    });
    it('should not count the immobilised piles', () => {
        // Given two board with the exact same piles, one having blocked piles
        const immobilizedState: LascaState = LascaState.from([
            [X, _, _, _, _, _, _],
            [_, O, _, _, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, X, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0).get();
        const mobileState: LascaState = LascaState.from([
            [X, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, X, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0).get();

        // When comparing them
        // Then the one with blocked pile should be considered lesser
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           immobilizedState,
                                                           MGPOptional.empty(),
                                                           mobileState,
                                                           MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('should count the potential mobility as primary board value', () => {
        // Given two board with the same piles, one with an unique forced capture, the other without
        const forcedState: LascaState = LascaState.from([
            [X, _, _, _, _, _, _],
            [_, O, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, X, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0).get(); // O has 1 pile, X has 2
        const freeState: LascaState = LascaState.from([
            [X, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, X, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0).get(); // O has 1 pile, X has 2

        // When comparing them
        // Then the two should be of equal value: the number of non-blocked piles times 11
        RulesUtils.expectStatesToBeOfEqualValue(minimax, forcedState, freeState);
    });
});
