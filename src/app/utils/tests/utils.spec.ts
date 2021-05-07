import { assert } from '../utils';

describe('utils', () => {
    describe('assert', () => {
        it('Should throw when condition is false', () => {
            expect(() => assert(false, 'erreur')).toThrowError('Assertion failure: erreur');
        });
    });
});
