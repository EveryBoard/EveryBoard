/* eslint-disable max-lines-per-function */
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ApagosSquare } from '../ApagosSquare';

describe('ApagosSquare', () => {

    it('should refuse creating square with more pieces than the capacity', () => {
        const reason: string = 'invalid starting space';
        expect(ApagosSquare.from(1, 0, 0)).toEqual(MGPFallible.failure(reason));
    });
});
