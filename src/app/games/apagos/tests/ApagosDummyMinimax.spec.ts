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
});
