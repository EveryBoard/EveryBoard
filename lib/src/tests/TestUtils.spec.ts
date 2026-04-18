/* eslint-disable max-lines-per-function */
import { TestUtils } from './TestUtils';
import { Utils } from '../Utils';

describe('TestUtils', () => {
    describe('expectToThrowAndLog', () => {
        it('should work with multiple invocations', () => {
            TestUtils.expectToThrowAndLog(() => Utils.assert(false, 'failure'),
                                          'failure');
            TestUtils.expectToThrowAndLog(() => Utils.assert(false, 'failure'),
                                          'failure');
        });
    });

});
