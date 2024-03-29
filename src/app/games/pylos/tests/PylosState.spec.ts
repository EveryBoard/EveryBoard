/* eslint-disable max-lines-per-function */
import { PylosCoord } from '../PylosCoord';
import { PylosRules } from '../PylosRules';
import { PylosState } from '../PylosState';

describe('PylosState', () => {

    describe('isSupporting', () => {

        it('should always tell that level 3 space are not supporting', () => {
            const state: PylosState = PylosRules.get().getInitialState();
            expect(state.isSupporting(new PylosCoord(0, 0, 3))).toBeFalse();
        });

    });

});
