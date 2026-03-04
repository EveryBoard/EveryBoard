import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

import { Utils } from '@everyboard/lib';

import { Player } from '../../../jscaip/Player';
import { Debug } from '../../../utils/Debug';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@Debug.log
export class TimerComponent implements OnDestroy {

    @Input() player: Player;
    @Input() debugName: string;
    @Input() timeToAdd: string;
    @Input() dangerTimeLimit: number;
    @Input() active: boolean;
    @Input() canAddTime: boolean;

    public remainingSeconds: number;
    public displayedSec: number;
    public displayedMinute: number;
    private timeoutHandle: number | null = null; // A number representing the timer handle. Not a unit.
    private updateHandle: number | null = null; // A number representing the timer handle. Not a unit.
    private isPaused: boolean = true;
    private isSet: boolean = false;
    private started: boolean = false;
    private startTime: number;

    @Output() outOfTimeAction: EventEmitter<void> = new EventEmitter<void>();
    @Output() addTimeToOpponent: EventEmitter<void> = new EventEmitter<void>();

    public static readonly DANGER_TIME_EVEN: string = 'has-background-danger has-text-white';
    public static readonly DANGER_TIME_ODD: string = 'has-background-warning has-text-white';
    public static readonly PASSIVE_STYLE: string = 'has-text-passive is-italic';
    public static readonly SAFE_TIME: string = '';

    public cssClasses: string = TimerComponent.SAFE_TIME;

    public constructor(private readonly cdr: ChangeDetectorRef) {}

    // Set the duration (in seconds, floating number) for a non-started timer
    public setDuration(seconds: number): void {
        Utils.assert(this.started === false, 'Should not set a timer that has already been started (' + this.debugName + ')!');

        this.isSet = true;
        this.changeDuration(seconds);
    }

    public changeDuration(seconds: number): void {
        Utils.assert(this.isPaused, 'Should not change duration of a clock while it is running');
        this.remainingSeconds = seconds;
        this.displayDuration();
    }

    public subtract(seconds: number): void {
        this.changeDuration(this.remainingSeconds - seconds);
    }

    private displayDuration(): void {
        this.displayedSec = Math.floor(this.remainingSeconds % 60);
        this.displayedMinute = Math.floor((this.remainingSeconds - this.displayedSec) / 60);
        this.cdr.detectChanges();
    }

    public start(): void {
        // duration is in ms
        Utils.assert(this.isSet, 'Should not start a timer that has not been set!');
        Utils.assert(this.started === false, 'Should not start timer that has already been started (' + this.debugName + ')');

        this.started = true;
        this.resume();
    }

    public resume(): void {
        Utils.assert(this.isPaused && this.started, 'Should only resume timer that are started and paused!');

        this.startTime = Date.now() / 1000;
        const remainingTimeOnResume: number = this.remainingSeconds;
        this.isPaused = false;
        this.timeoutHandle = window.setTimeout(() => {
            this.onEndReached();
        }, remainingTimeOnResume * 1000);
        this.countSeconds();
    }

    private onEndReached(): void {
        this.isPaused = true;
        this.started = false;
        this.clearTimeouts();
        this.changeDuration(0);
        this.outOfTimeAction.emit();
    }

    private countSeconds(): void {
        this.updateHandle = window.setTimeout(() => {
            this.updateShownTime();
        }, 300); // update a bit more frequently than every second to account for drifts
    }

    public isIdle(): boolean {
        const isUnstarted: boolean = this.started === false;
        return isUnstarted || this.isPaused;
    }

    public pause(): void {
        Utils.assert(this.started, 'Should not pause not started timer (' + this.debugName + ')');
        Utils.assert(this.isPaused === false, 'Should not pause already paused timer (' + this.debugName + ')');

        this.clearTimeouts();
        this.isPaused = true;
        this.updateShownTime();
    }

    public stop(): void {
        Utils.assert(this.started, 'Should only stop timer that are started!');

        if (this.isPaused === false) {
            this.pause();
        }
        this.started = false;
        this.isSet = false;
    }

    public isStarted(): boolean {
        return this.started;
    }

    public getTimeClass(): string {
        if (this.active === false) {
            return TimerComponent.PASSIVE_STYLE;
        }
        if (this.remainingSeconds < this.dangerTimeLimit) {
            if (this.remainingSeconds % 2 < 1) {
                return TimerComponent.DANGER_TIME_ODD;
            } else {
                return TimerComponent.DANGER_TIME_EVEN;
            }
        } else {
            return TimerComponent.SAFE_TIME;
        }
    }

    private updateShownTime(): void {
        const nowSeconds: number = Date.now() / 1000;
        this.remainingSeconds -= (nowSeconds - this.startTime);
        this.cssClasses = this.getTimeClass();
        this.startTime = nowSeconds;
        this.displayDuration();
        if (this.isPaused === false) {
            this.countSeconds();
        }
    }

    private clearTimeouts(): void {
        if (this.updateHandle != null) {
            window.clearTimeout(this.updateHandle);
            this.updateHandle = null;
        }

        if (this.timeoutHandle != null) {
            window.clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }

    public addTime(): void {
        this.addTimeToOpponent.emit();
    }

    public ngOnDestroy(): void {
        this.clearTimeouts();
    }

}
