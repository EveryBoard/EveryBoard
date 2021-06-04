import { PylosCoord } from '../PylosCoord';
import { PylosPartSlice } from '../PylosPartSlice';

describe('PylosPartSlice:', () => {
    describe('isSupporting', () => {
        it('Should always tell that level 3 case are not supporting', () => {
            const slice: PylosPartSlice = PylosPartSlice.getInitialSlice();
            expect(slice.isSupporting(new PylosCoord(0, 0, 3))).toBeFalse();
        });
        xit('Should recognize supporting bloc');
    });
});
