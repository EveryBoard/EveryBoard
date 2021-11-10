import { ApagosCoord } from '../ApagosCoord';
import { ApagosState } from '../ApagosState';

describe('ApagosState', () => {

    it('should override uneeded function getNullable and isOnBoard', () => { // TODOTODO: delete when strictness is merged
        const state: ApagosState = ApagosState.getInitialState(); // TODOTODO: delete when strictness is merged
        expect(state.isOnBoard(null)).toBeFalse(); // TODOTODO: delete when strictness is merged
        expect(state.isOnBoard(ApagosCoord.ZERO)).toBeTrue(); // TODOTODO: delete when strictness is merged
        expect(state.getNullable(null)).toBeNull(); // TODOTODO: delete when strictness is merged
        expect(state.getNullable(ApagosCoord.ONE)).not.toBeNull(); // TODOTODO: delete when strictness is merged
    });
});
