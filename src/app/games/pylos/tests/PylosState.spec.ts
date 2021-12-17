import { PylosCoord } from '../PylosCoord';
import { PylosState } from '../PylosState';

describe('PylosState:', () => {

    describe('isSupporting', () => {
        it('Should always tell that level 3 case are not supporting', () => {
            const state: PylosState = PylosState.getInitialState();
            expect(state.isSupporting(new PylosCoord(0, 0, 3))).toBeFalse();
        });
    });
});
