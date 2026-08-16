/* eslint-disable max-lines-per-function */
import { TimeUtils } from '../TimeUtils';

describe('TimeUtils', () => {

    describe('sleep', () => {

        it('should resolve after the given delay', async() => {
            // Given a fake clock and a sleep promise
            jasmine.clock().install();
            const sleepPromise: Promise<void> = TimeUtils.sleep(100);

            // When 99 ms have elapsed
            jasmine.clock().tick(99);

            // Then the sleep should not have resolved yet
            let resolved = false;
            sleepPromise.then(() => resolved = true);
            await Promise.resolve();
            expect(resolved).toBeFalse();

            // When 1 more ms has elapsed
            jasmine.clock().tick(1);
            await sleepPromise;

            // Then the sleep should have resolved
            expect(resolved).toBeTrue();

            jasmine.clock().uninstall();
        });

    });

});
