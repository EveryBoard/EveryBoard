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
        minimax = new ApagosDummyMinimax(ApagosRules.get(), 'ApagosDummyMinimax');
    });
    it('should have all 8 drop as possible move at first turn', () => {
        // Given initial node
        const initialState: ApagosState = ApagosState.getInitialState();
        const node: ApagosNode = new ApagosNode(initialState);

        // When calling getListMoves
        const moves: ApagosMove[] = minimax.getListMoves(node);

        // Then there should be 8 drops
        expect(moves.length).toBe(8);
        const isThereTransfer: boolean = moves.some((move: ApagosMove) => move.isDrop() === false);
        expect(isThereTransfer).toBeFalse();
    });
    it('should consider having more rightmost pieces as an advantage', () => {
        // Given two states with the second having more pieces of the current player in the rightmost space
        const weakerState: ApagosState = ApagosState.fromRepresentation(0, [
            [0, 0, 0, 0],
            [0, 0, 0, 1],
            [7, 5, 3, 1],
        ], 10, 9);
        const strongerState: ApagosState = ApagosState.fromRepresentation(0, [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], 10, 10);

        // When computing the value of the boards
        // Then the second state should be deemed advantageous for the current player
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakerState,
                                                           MGPOptional.empty(),
                                                           strongerState,
                                                           MGPOptional.empty(),
                                                           Player.ZERO);

    });
});
