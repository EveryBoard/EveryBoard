import { DebugElement } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { CountDownComponent } from './count-down.component';

describe('CountDownComponent', () => {

    let testUtils: SimpleComponentTestUtils<CountDownComponent>;

    let component: CountDownComponent;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(CountDownComponent);
        component = testUtils.getComponent();
    }));
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('set', () => {
        it('should throw when setting chrono already started', () => {
            component.setDuration(1250);
            component.start();
            const error: string = 'Should not set a chrono that has already been started (undefined)!';
            expect(() => component.setDuration(1250)).toThrowError(error);
        });
    });
    describe('start', () => {
        it('should throw when starting without having been set', () => {
            expect(() => component.start()).toThrowError('Should not start a chrono that has not been set!');
        });
        it('should throw when starting twice', () => {
            component.setDuration(1250);
            component.start();
            const error: string = 'Should not start chrono that has already been started (undefined)';
            expect(() => component.start()).toThrowError(error);
        });
        it('should show remaining time once set', () => {
            component.setDuration(62000);
            testUtils.detectChanges();
            const element: DebugElement = testUtils.findElement('#remainingTime');
            const timeText: string = element.nativeElement.innerHTML;
            expect(timeText).toBe('1:02');
        });
        it('should throw when starting stopped chrono again', () => {
            component.setDuration(1250);
            component.start();
            expect(component.isStarted()).toBeTrue();
            component.stop();
            expect(() => component.start()).toThrowError('Should not start a chrono that has not been set!');
        });
    });
    describe('pause', () => {
        it('Should throw when pausing already paused chrono', () => {
            component.setDuration(1250);
            component.start();
            component.pause();
            const error: string = 'Should not pause already paused chrono (undefined)';
            expect(() => component.pause()).toThrowError(error);
        });
        it('Should throw when pausing not started chrono', () => {
            const error: string = 'Should not pause not started chrono (undefined)';
            expect(() => component.pause()).toThrowError(error);
        });
    });
    describe('resume', () => {
        it('should throw when resuming not started chrono', () => {
            expect(() => component.resume()).toThrowError('Should only resume chrono that are started and paused!');
        });
        it('should throw when resuming stopped chrono', () => {
            component.setDuration(1250);
            component.start();
            component.stop();
            expect(() => component.resume()).toThrowError('Should only resume chrono that are started and paused!');
        });
    });
    describe('stop', () => {
        it('should throw when stopping not started chrono', () => {
            expect(() => component.stop()).toThrowError('Should only stop chrono that are started!');
        });
        it('should throw when stopping stopped chrono', () => {
            component.setDuration(1250);
            component.start();
            component.stop();
            expect(() => component.stop()).toThrowError('Should only stop chrono that are started!');
        });
    });
    it('should update written time', fakeAsync(() => {
        spyOn(component.outOfTimeAction, 'emit').and.callThrough();
        component.setDuration(3000);
        component.start();
        tick(1000);
        testUtils.detectChanges();
        let timeText: string = testUtils.findElement('#remainingTime').nativeElement.innerHTML;
        expect(timeText).toBe('0:02');
        tick(1000);
        testUtils.detectChanges();
        timeText = testUtils.findElement('#remainingTime').nativeElement.innerHTML;
        expect(timeText).toBe('0:01');
        component.stop();
    }));
    it('should update written time correctly (closest rounding) even when playing in less than refreshing time', fakeAsync(() => {
        spyOn(component.outOfTimeAction, 'emit').and.callThrough();
        component.setDuration(599501); // 9 minutes 59 sec 501 ms
        testUtils.detectChanges();
        let timeText: string = testUtils.findElement('#remainingTime').nativeElement.innerHTML;
        expect(timeText).toBe('9:59');
        component.start();

        tick(401); // 9 min 59.501s -> 9 min 59.1 (9:59)
        component.pause();
        testUtils.detectChanges();
        timeText = testUtils.findElement('#remainingTime').nativeElement.innerHTML;
        expect(timeText).toBe('9:59');

        component.resume();
        tick(200); // 9 min 59.1 -> 9 min 58.9 (9:58)
        component.pause();
        testUtils.detectChanges();
        timeText = testUtils.findElement('#remainingTime').nativeElement.innerHTML;
        expect(timeText).toBe('9:58');
    }));
    it('should emit when timeout reached', fakeAsync(() => {
        spyOn(component.outOfTimeAction, 'emit').and.callThrough();
        component.setDuration(2000);
        component.start();
        tick(1000);
        expect(component.outOfTimeAction.emit).not.toHaveBeenCalledOnceWith();
        tick(1000);
        expect(component.outOfTimeAction.emit).toHaveBeenCalledOnceWith();
    }));
    describe('Add Time Button', () => {
        it('should offer opportunity to add time if allowed', fakeAsync(async() => {
            // Given a CountDownComponent allowed to add time, with 1 minute remaining
            component.canAddTime = true;
            component.remainingMs = 60 * 1000;
            testUtils.detectChanges();

            // when clicking the add time button
            spyOn(component.addTimeToOpponent, 'emit').and.callThrough();
            await testUtils.clickElement('#addTimeButton');

            // the component should have called addTimeToOpponent
            expect(component.addTimeToOpponent.emit).toHaveBeenCalledOnceWith();
        }));
        it('should not display button when not allowed to add time', fakeAsync(async() => {
            // given a CountDownComponent not allowed to add time
            component.canAddTime = false;
            testUtils.detectChanges();

            // the component should not have that button
            testUtils.expectElementNotToExist('#addTimeButton');
        }));
    });
    describe('Style depending of remaining time', () => {
        it('Should be safe style when upper than limit', () => {
            component.dangerTimeLimit = 10 * 1000;
            component.setDuration(12 * 1000);
            expect(component.getTimeStyle()).toEqual(CountDownComponent.SAFE_TIME);
        });
        it('Should be first danger style when lower than limit and even remaining second', () => {
            component.dangerTimeLimit = 10 * 1000;
            component.setDuration(9 * 1000);
            expect(component.getTimeStyle()).toEqual(CountDownComponent.DANGER_TIME_EVEN);
        });
        it('Should be second danger style when lower than limit and odd remaining second', () => {
            component.dangerTimeLimit = 10 * 1000;
            component.setDuration(8 * 1000);
            expect(component.getTimeStyle()).toEqual(CountDownComponent.DANGER_TIME_ODD);
        });
        it('Should be in passive style when passive', () => {
            // given a chrono that could be in danger time style
            component.setDuration(8 * 1000);

            // when it become passive
            component.active = false;

            // then it should still be in passive style
            expect(component.getTimeStyle()).toEqual(CountDownComponent.PASSIVE_STYLE);
        });
    });
});
