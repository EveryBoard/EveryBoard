import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { display } from 'src/app/utils/utils';

@Component({
    selector: 'app-count-down',
    templateUrl: './count-down.component.html',
})
export class CountDownComponent implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    @Input() debugName: string;
    @Input() dangerTimeLimit: number;
    @Input() active: boolean;

    public remainingMs: number;
    public displayedSec: number;
    public displayedMinute: number;
    private timeoutHandleGlobal: number | null;
    private timeoutHandleSec: number | null;
    private isPaused: boolean = true;
    private isSet: boolean = false;
    private started: boolean = false;
    private startTime: number;

    @Output() outOfTimeAction: EventEmitter<void> = new EventEmitter<void>();

    public readonly DANGER_TIME_EVEN: string = 'has-background-danger has-text-white';
    public readonly DANGER_TIME_ODD: string = 'has-background-warning has-text-white';
    public readonly PASSIVE_STYLE: string = 'has-text-passive is-italic';
    public readonly SAFE_TIME: string = '';

    public style: string = this.SAFE_TIME;

    public ngOnInit(): void {
        display(CountDownComponent.VERBOSE, 'CountDownComponent.ngOnInit (' + this.debugName + ')');
    }
    public setDuration(duration: number): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.set(' + duration + 'ms)');
        // duration is in ms
        if (this.started) {
            throw new Error('Should not set a chrono that has already been started (' + this.debugName + ')!');
        }
        this.isSet = true;
        this.changeDuration(duration);
    }
    public changeDuration(ms: number): void {
        this.remainingMs = ms;
        this.displayedSec = ms % (60 * 1000);
        this.displayedMinute = (ms - this.displayedSec) / (60 * 1000);
        this.displayedSec = Math.floor(this.displayedSec / 1000);
    }
    public start(): void {
        // duration is in ms
        display(CountDownComponent.VERBOSE, this.debugName + '.start(' + this.remainingMs + 'ms);');

        if (this.isSet === false) {
            throw new Error('Should not start a chrono that has not been set!');
        }
        if (this.started) {
            throw new Error('Should not start chrono that has already been started (' + this.debugName + ')');
        }
        this.started = true;
        this.resume();
    }
    public resume(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.resume(' + this.remainingMs + 'ms)');

        if (this.isPaused === false || this.started === false) {
            throw new Error('Should only resume chrono that are started and paused!');
        }
        this.startTime = Date.now();
        const remainingTimeOnResume: number = this.remainingMs;
        this.isPaused = false;
        this.timeoutHandleGlobal = window.setTimeout(() => {
            this.onEndReached();
        }, remainingTimeOnResume);
        this.countSeconds();
    }
    private onEndReached(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.onEndReached');

        this.isPaused = true;
        this.started = false;
        this.clearTimeouts();
        this.changeDuration(0);
        this.outOfTimeAction.emit();
    }
    private countSeconds(): void {
        this.timeoutHandleSec = window.setTimeout(() => {
            this.updateShownTime();
        }, 1000);
    }
    public isIdle(): boolean {
        return this.isPaused || (this.started === false);
    }
    public pause(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.pause(' + this.remainingMs + 'ms)');

        if (!this.started) {
            throw new Error('Should not pause not started chrono (' + this.debugName + ')');
        }
        if (this.isPaused) {
            throw new Error('Should not pause already paused chrono (' + this.debugName + ')');
        }

        this.clearTimeouts();
        this.isPaused = true;
        this.updateShownTime();
    }
    public stop(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.stop(' + this.remainingMs + 'ms)');

        if (this.started === false) {
            throw new Error('Should only stop chrono that are started!');
        }
        this.pause();
        this.started = false;
        this.isSet = false;
    }
    public isStarted(): boolean {
        return this.started;
    }
    public getTimeClass(): string {
        if (this.active === false) {
            return this.PASSIVE_STYLE;
        }
        if (this.remainingMs < this.dangerTimeLimit) {
            if (this.remainingMs % 2000 < 1000) {
                return this.DANGER_TIME_ODD;
            } else {
                return this.DANGER_TIME_EVEN;
            }
        } else {
            return this.SAFE_TIME;
        }
    }
    private updateShownTime(): void {
        const now: number = Date.now();
        this.remainingMs -= (now - this.startTime);
        this.changeDuration(this.remainingMs);
        this.style = this.getTimeClass();
        this.startTime = now;
        if (!this.isPaused) {
            this.countSeconds();
        }
    }
    private clearTimeouts(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.clearTimeouts');

        if (this.timeoutHandleSec != null) {
            clearTimeout(this.timeoutHandleSec);
            this.timeoutHandleSec = null;
        }

        if (this.timeoutHandleGlobal != null) {
            clearTimeout(this.timeoutHandleGlobal);
            this.timeoutHandleGlobal = null;
        }
    }
    public ngOnDestroy(): void {
        this.clearTimeouts();
    }
}
