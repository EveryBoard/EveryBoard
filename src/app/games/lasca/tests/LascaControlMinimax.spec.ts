/* eslint-disable max-lines-per-function */
import { min } from 'rxjs';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LascaControlMinimax } from '../LascaControlMinimax';
import { LascaMove } from '../LascaMove';
import { LascaNode, LascaRules } from '../LascaRules';
import { LascaPiece, LascaSpace, LascaState } from '../LascaState';

describe('LascaControlAndDominateMinimax', () => {

    const u: LascaSpace = new LascaSpace([LascaPiece.ZERO]);
    const v: LascaSpace = new LascaSpace([LascaPiece.ONE]);
    const _: LascaSpace = LascaSpace.EMPTY;
    let minimax: LascaControlMinimax;

    beforeEach(() => {
        const ruler: LascaRules = LascaRules.get();
        minimax = new LascaControlMinimax(ruler, 'Lasca Control Minimax');
    });
    it('should return full list of captures when capture must be done', () => {
        // Given any LascaControlMinimax and a state where current player should capture
        const state: LascaState = LascaState.from([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, v, _, _, _, _],
            [_, u, _, u, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, u, _],
            [_, _, _, _, _, _, _],
        ], 1).get();
        const node: LascaNode = new MGPNode(state);

        // When asking it a list of move for this state
        const moves: LascaMove[] = minimax.getListMoves(node);

        // Then it should return the list of capture
        expect(moves.length).toBe(2);
    });
    it('should return full list of steps when no capture must be done', () => {
        // Given any LascaControlMinimax and a state where only steps can be made
        const state: LascaState = LascaState.getInitialState();
        const node: LascaNode = new MGPNode(state);

        // When asking it a list of move for that state
        const moves: LascaMove[] = minimax.getListMoves(node);

        // Then it should return the list of steps
        expect(moves.length).toBe(6);
    });
    it('should not count the immobilised piles', () => {
        // Given two board with the exact same piles, one having blocked piles
        const immobilizedState: LascaState = LascaState.from([
            [v, _, _, _, _, _, _],
            [_, u, _, _, _, _, _],
            [_, _, u, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0).get();
        const mobileState: LascaState = LascaState.from([
            [v, _, _, _, _, _, _],
            [_, _, _, u, _, _, _],
            [_, _, u, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
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
            [v, _, _, _, _, _, _],
            [_, u, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0).get(); // O has 1 pile, X has 2
        const freeState: LascaState = LascaState.from([
            [v, _, _, _, _, _, _],
            [_, _, _, u, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, v, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0).get(); // O has 1 pile, X has 2

        // When comparing them
        // Then the two should be of equal value: the number of non-blocked piles times 11
        RulesUtils.expectStatesToBeOfEqualValue(minimax, forcedState, freeState);
    });
});
