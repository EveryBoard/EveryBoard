/* eslint-disable max-lines-per-function */
import { ApagosMove } from '../ApagosMove';
import { ApagosMoveGenerator } from '../ApagosMoveGenerator';
import { ApagosNode } from '../ApagosRules';
import { ApagosState } from '../ApagosState';

describe('ApagosMoveGenerator', () => {

    let moveGenerator: ApagosMoveGenerator;

    beforeEach(() => {
        moveGenerator = new ApagosMoveGenerator();
    });
    it('should have all 8 drop as possible move at first turn', () => {
        // Given initial node
        const initialState: ApagosState = ApagosState.getInitialState();
        const node: ApagosNode = new ApagosNode(initialState);

        // When calling getListMoves
        const moves: ApagosMove[] = moveGenerator.getListMoves(node);

        // Then there should be 8 drops
        expect(moves.length).toBe(8);
        const isThereTransfer: boolean = moves.some((move: ApagosMove) => move.isDrop() === false);
        expect(isThereTransfer).toBeFalse();
    });
});