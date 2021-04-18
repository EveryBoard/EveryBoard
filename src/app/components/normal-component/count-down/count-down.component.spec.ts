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
            component.setDuration(2000);
            fixture.detectChanges();
            const element: DebugElement = fixture.debugElement.query(By.css('#remainingTime'));
            const timeText: string = element.nativeElement.innerHTML;
            expect(timeText).toBe('2.0s');
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
    });
    describe('stop', () => {
        it('should throw when stopping not started chrono', () => {
            expect(() => component.stop()).toThrowError('Should only stop chrono that are started!');
        });
        it('should throw when resuming stopped chrono', () => {
            component.setDuration(1250);
            component.start();
            component.stop();
            expect(() => component.resume()).toThrowError('Should only resume chrono that are started and paused!');
        });
    });
    it('should update written time', fakeAsync(() => {
        spyOn(component.outOfTimeAction, 'emit').and.callThrough();
        component.setDuration(3000);
        component.start();
        tick(1000);
        fixture.detectChanges();
        let timeText: string = fixture.debugElement.query(By.css('#remainingTime')).nativeElement.innerHTML;
        expect(timeText).toBe('2.0s');
        tick(1000);
        fixture.detectChanges();
        timeText = fixture.debugElement.query(By.css('#remainingTime')).nativeElement.innerHTML;
        expect(timeText).toBe('1.0s');
        component.stop();
    }));
    it('should update written time correctly even when playing in less than refreshing time', fakeAsync(() => {
        spyOn(component.outOfTimeAction, 'emit').and.callThrough();
        component.setDuration(3000);
        component.start();

        tick(800);
        component.pause();
        fixture.detectChanges();
        let timeText: string = fixture.debugElement.query(By.css('#remainingTime')).nativeElement.innerHTML;
        expect(timeText).toBe('2.2s');

        component.resume();
        tick(900);
        component.pause();
        fixture.detectChanges();
        timeText = fixture.debugElement.query(By.css('#remainingTime')).nativeElement.innerHTML;
        expect(timeText).toBe('1.3s');
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
});
