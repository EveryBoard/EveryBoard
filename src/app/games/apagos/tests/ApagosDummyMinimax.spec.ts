/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ApagosDummyMinimax } from '../ApagosDummyMinimax';
import { ApagosMove } from '../ApagosMove';
import { ApagosNode, ApagosRules } from '../ApagosRules';
import { ApagosState } from '../ApagosState';

describe('ApagosDummyMinimax', () => {

    let minimax: ApagosDummyMinimax;

    beforeEach(() => {
        const ruler: ApagosRules = new ApagosRules(ApagosState);
        minimax = new ApagosDummyMinimax(ruler, 'ApagosDummyMinimax');
    });
    it('Should have all 8 drop as possible move at first turn', () => {
        // given initial node
        const initialState: ApagosState = ApagosState.getInitialState();
        const node: ApagosNode = new ApagosNode(initialState);

        // when calling getListMoves
        const moves: ApagosMove[] = minimax.getListMoves(node);

        // then there should be 8 drops
        expect(moves.length).toBe(8);
        const isThereTransfer: boolean = moves.some((move: ApagosMove) => move.isDrop() === false);
        expect(isThereTransfer).toBeFalse();
    });
    it('should consider having advantage has a higher value board', () => {
        // Given two states each with more pieces of one specific player
        const weakerState: ApagosState = ApagosState.fromRepresentation(0, [
            [0, 0, 0, 0],
            [7, 0, 0, 1],
            [7, 5, 3, 1],
        ], 10, 2);
        const strongerState: ApagosState = ApagosState.fromRepresentation(0, [
            [7, 0, 0, 1],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], 2, 10);

        // When computing the value of the boards
        // Then the state with the most pieces of the player should have a higher value
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakerState,
                                                           MGPOptional.empty(),
                                                           strongerState,
                                                           MGPOptional.empty(),
                                                           Player.ZERO);

    });
});
