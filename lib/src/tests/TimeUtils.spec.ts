/* eslint-disable max-lines-per-function */
import { TimeUtils } from '../TimeUtils';

describe('TimeUtils', () => {

    describe('sleep', () => {

        it('should resolve after the given delay', async() => {
            jasmine.clock().install(); // need to fake time in this test

            // Given a sleep promise of 100ms
            let resolved: boolean = false;
            const sleepPromise: Promise<void> = TimeUtils.sleep(100);
            void sleepPromise.then(() => resolved = true);

            // When 99 ms have elapsed
            jasmine.clock().tick(99);
            await Promise.resolve();

            // Then the sleep should not have resolved yet
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
