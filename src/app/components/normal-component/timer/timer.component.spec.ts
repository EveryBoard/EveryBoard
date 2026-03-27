/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';

import { TestUtils } from '@everyboard/lib';

import { Player } from '../../../jscaip/Player';
import { SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';

import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {

    let testUtils: SimpleComponentTestUtils<TimerComponent>;

    let component: TimerComponent;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(TimerComponent);
        component = testUtils.getComponent();
        testUtils.setInput('player', Player.ZERO);
        testUtils.setInput('debugName', 'test-timer');
        testUtils.setInput('active', 'false');
        testUtils.setInput('dangerTimeLimit', 30);
        testUtils.setInput('canAddTime', false);
        testUtils.setInput('timeToAdd', 30);
    }));
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('set', () => {
        it('should throw when setting timer already started', () => {
            component.setDuration(1);
            component.start();
            const error: string = 'Should not set a timer that has already been started (test-timer)!';
            TestUtils.expectToThrowAndLog(() => component.setDuration(1), error);
        });
    });
    describe('start', () => {
        it('should throw when starting without having been set', () => {
            const error: string = 'Should not start a timer that has not been set!';
            TestUtils.expectToThrowAndLog(() => component.start(), error);
        });
        it('should throw when starting twice', () => {
            component.setDuration(1);
            component.start();
            const error: string = 'Should not start timer that has already been started (test-timer)';
            TestUtils.expectToThrowAndLog(() => component.start(), error);
        });
        it('should show remaining time once set', () => {
            component.setDuration(62);
            testUtils.detectChanges();
            const element: DebugElement = testUtils.findElement('.data-remaining-time');
            const timeText: string = element.nativeElement.innerText;
            expect(timeText).toBe('1:02');
        });
        it('should throw when starting stopped timer again', () => {
            component.setDuration(1);
            component.start();
            expect(component.isStarted()).toBeTrue();
            component.stop();

            const error: string = 'Should not start a timer that has not been set!';
            TestUtils.expectToThrowAndLog(() => component.start(), error);
        });
    });
    describe('pause', () => {
        it('should throw when pausing already paused timer', () => {
            component.setDuration(1);
            component.start();
            component.pause();

            const error: string = 'Should not pause already paused timer (test-timer)';
            TestUtils.expectToThrowAndLog(() => component.pause(), error);
        });
        it('should throw when pausing not started timer', () => {
            const error: string = 'Should not pause not started timer (test-timer)';
            TestUtils.expectToThrowAndLog(() => component.pause(), error);
        });
    });
    describe('resume', () => {
        it('should throw when resuming not started timer', () => {
            const error: string = 'Should only resume timers that are started and paused!';
            TestUtils.expectToThrowAndLog(() => component.resume(), error);
        });
        it('should throw when resuming stopped timer', () => {
            component.setDuration(1);
            component.start();
            component.stop();
            const error: string = 'Should only resume timers that are started and paused!';
            TestUtils.expectToThrowAndLog(() => component.resume(), error);
        });
    });
    describe('stop', () => {
        it('should throw when stopping not started timer', () => {
            const error: string = 'Should only stop timer that are started!';
            TestUtils.expectToThrowAndLog(() => component.stop(), error);
        });
        it('should throw when stopping stopped timer', () => {
            component.setDuration(1);
            component.start();
            component.stop();
            const error: string = 'Should only stop timer that are started!';
            TestUtils.expectToThrowAndLog(() => component.stop(), error);
        });
    });
    it('should update written time', fakeAsync(() => {
        spyOn(component.outOfTimeAction, 'emit').and.callThrough();
        component.setDuration(3);
        component.start();
        tick(1000);
        testUtils.detectChanges();
        let timeText: string = testUtils.findElement('.data-remaining-time').nativeElement.innerText;
        expect(timeText).toBe('0:02');
        tick(1000);
        testUtils.detectChanges();
        timeText = testUtils.findElement('.data-remaining-time').nativeElement.innerText;
        expect(timeText).toBe('0:01');
        component.stop();
    }));
    it('should update written time correctly (closest rounding) even when playing in less than refreshing time', fakeAsync(() => {
        spyOn(component.outOfTimeAction, 'emit').and.callThrough();
        component.setDuration((9 * 60 + 59) + 0.501); // 9 minutes 59 sec 501 ms
        testUtils.detectChanges();
        let timeText: string = testUtils.findElement('.data-remaining-time').nativeElement.innerText;
        expect(timeText).toBe('9:59');
        component.start();

        tick(401); // 9 min 59.501s -> 9 min 59.1 (9:59)
        component.pause();
        testUtils.detectChanges();
        timeText = testUtils.findElement('.data-remaining-time').nativeElement.innerText;
        expect(timeText).toBe('9:59');

        component.resume();
        tick(200); // 9 min 59.1 -> 9 min 58.9 (9:58)
        component.pause();
        testUtils.detectChanges();
        timeText = testUtils.findElement('.data-remaining-time').nativeElement.innerText;
        expect(timeText).toBe('9:58');
    }));
    it('should emit when timeout reached', fakeAsync(() => {
        spyOn(component.outOfTimeAction, 'emit').and.callThrough();
        component.setDuration(2);
        component.start();
        tick(1000);
        expect(component.outOfTimeAction.emit).not.toHaveBeenCalledOnceWith();
        tick(1000);
        expect(component.outOfTimeAction.emit).toHaveBeenCalledOnceWith();
    }));
    describe('Add Time Button', () => {
        it('should offer opportunity to add time if allowed', fakeAsync(async() => {
            // Given a TimerComponent allowed to add time
            testUtils.setInput('canAddTime', true);
            testUtils.setInput('remainingSeconds', 60);
            testUtils.detectChanges();

            // When clicking the add time button
            spyOn(component.addTimeToOpponent, 'emit').and.callThrough();
            await testUtils.clickElement('.data-add-time');

            // Then the component should have called addTimeToOpponent
            expect(component.addTimeToOpponent.emit).toHaveBeenCalledOnceWith();
        }));
        it('should not display button when not allowed to add time', fakeAsync(async() => {
            // Given a TimerComponent not allowed to add time
            testUtils.setInput('canAddTime', false);
            testUtils.detectChanges();

            // Then the component should not have that button
            testUtils.expectElementNotToExist('.data-add-time');
        }));

    });
    describe('Style depending of remaining time', () => {
        it('should be safe style when upper than limit', () => {
            testUtils.setInput('dangerTimeLimit', 10);
            component.setDuration(12);
            expect(component.getTimeClass()).toEqual(TimerComponent.SAFE_TIME);
        });
        it('should be first danger style when lower than limit and even remaining second', () => {
            testUtils.setInput('dangerTimeLimit', 10);
            component.setDuration(9);
            expect(component.getTimeClass()).toEqual(TimerComponent.DANGER_TIME_EVEN);
        });
        it('should be second danger style when lower than limit and odd remaining second', () => {
            testUtils.setInput('dangerTimeLimit', 10);
            component.setDuration(8);
            expect(component.getTimeClass()).toEqual(TimerComponent.DANGER_TIME_ODD);
        });
        it('should be in passive style when passive', () => {
            // Given a timer that could be in danger time style
            component.setDuration(8);

            // When it become passive
            testUtils.setInput('active', false);

            // Then it should still be in passive style
            expect(component.getTimeClass()).toEqual(TimerComponent.PASSIVE_STYLE);
        });
    });

});
