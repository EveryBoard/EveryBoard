import {PylosCoord} from '../pylos-coord/PylosCoord';
import {PylosPartSlice} from './PylosPartSlice';

describe('PylosPartSlice:', () => {
    it('Should always tell that level 3 case are not supporting', () => {
        const slice: PylosPartSlice = PylosPartSlice.getInitialSlice();
        expect(slice.isSupporting(new PylosCoord(0, 0, 3))).toBeFalse();
    });
});
