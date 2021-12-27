/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CountDownComponent } from './count-down.component';

describe('CountDownComponent', () => {

    let component: CountDownComponent;

    let fixture: ComponentFixture<CountDownComponent>;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            declarations: [CountDownComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(CountDownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
            fixture.detectChanges();
            const element: DebugElement = fixture.debugElement.query(By.css('#remainingTime'));
            const timeText: string = element.nativeElement.innerHTML;
            expect(timeText).toBe('1:02');
        });
        it('should throw when starting stopped chrono again', () => {
            component.setDuration(1250);
            component.start();
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
        fixture.detectChanges();
        let timeText: string = fixture.debugElement.query(By.css('#remainingTime')).nativeElement.innerHTML;
        expect(timeText).toBe('0:02');
        tick(1000);
        fixture.detectChanges();
        timeText = fixture.debugElement.query(By.css('#remainingTime')).nativeElement.innerHTML;
        expect(timeText).toBe('0:01');
        component.stop();
    }));
    it('should update written time correctly (closest rounding) even when playing in less than refreshing time', fakeAsync(() => {
        spyOn(component.outOfTimeAction, 'emit').and.callThrough();
        component.setDuration(599501); // 9 minutes 59 sec 501 ms
        fixture.detectChanges();
        let timeText: string = fixture.debugElement.query(By.css('#remainingTime')).nativeElement.innerHTML;
        expect(timeText).toBe('9:59');
        component.start();

        tick(401); // 9 min 59.501s -> 9 min 59.1 (9:59)
        component.pause();
        fixture.detectChanges();
        timeText = fixture.debugElement.query(By.css('#remainingTime')).nativeElement.innerHTML;
        expect(timeText).toBe('9:59');

        component.resume();
        tick(200); // 9 min 59.1 -> 9 min 58.9 (9:58)
        component.pause();
        fixture.detectChanges();
        timeText = fixture.debugElement.query(By.css('#remainingTime')).nativeElement.innerHTML;
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
    describe('Style depending of remaining time', () => {
        it('Should be safe style when upper than limit', () => {
            component.dangerTimeLimit = 10 * 1000;
            component.setDuration(12 * 1000);
            expect(component.getTimeStyle()).toEqual(component.SAFE_TIME);
        });
        it('Should be first danger style when lower than limit and even remaining second', () => {
            component.dangerTimeLimit = 10 * 1000;
            component.setDuration(9 * 1000);
            expect(component.getTimeStyle()).toEqual(component.DANGER_TIME_EVEN);
        });
        it('Should be second danger style when lower than limit and odd remaining second', () => {
            component.dangerTimeLimit = 10 * 1000;
            component.setDuration(8 * 1000);
            expect(component.getTimeStyle()).toEqual(component.DANGER_TIME_ODD);
        });
        it('Should be in passive style when passive', () => {
            // given a chrono that could be in danger time style
            component.setDuration(8 * 1000);

            // when it become passive
            component.active = false;

            // then it should still be in passive style
            expect(component.getTimeStyle()).toEqual(component.PASSIVE_STYLE);
        });
    });
});
