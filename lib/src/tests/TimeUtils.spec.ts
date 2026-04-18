/* eslint-disable max-lines-per-function */
import { TimeUtils } from '../TimeUtils';

describe('TimeUtils', () => {

    describe('sleep', () => {

        it('should resolve after the given delay', async() => {
            // Given a start time
            const before: number = Date.now();
            const msToSleep: number = 100;

            // When sleeping for some time
            await TimeUtils.sleep(msToSleep);

            // Then at least this time should have elapsed, and not much more
            expect(Date.now() - before).toBeGreaterThanOrEqual(msToSleep);
            expect(Math.abs((Date.now() - before) - msToSleep)).toBeLessThan(5);
        });

    });

});
