import { ApagosCoord } from '../ApagosCoord';
import { ApagosState } from '../ApagosState';

describe('ApagosState', () => {

    it('should override uneeded function getNullable and isOnBoard', () => {
        const state: ApagosState = ApagosState.getInitialState();
        expect(state.isOnBoard(null)).toBeFalse();
        expect(state.isOnBoard(ApagosCoord.ZERO)).toBeTrue();
        expect(state.getNullable(null)).toBeNull(); // TODOTODO: delete when strictness is merged
        expect(state.getNullable(ApagosCoord.ONE)).not.toBeNull(); // TODOTODO: delete when strictness is merged
    });
});
