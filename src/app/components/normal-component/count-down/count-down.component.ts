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

    remainingTime: number;
    private timeoutHandleGlobal: number;
    private timeoutHandleSec: number;
    private isPaused: boolean = true;
    private isSet: boolean = false;
    private started: boolean = false;
    private startTime: number;

    @Output() outOfTimeAction: EventEmitter<void> = new EventEmitter<void>();

    public readonly DANGER_TIME_EVEN: { [key: string]: string } = {
        'color': 'red',
        'font-weight': 'bold',
    };
    public readonly DANGER_TIME_ODD: { [key: string]: string } = {
        'color': 'white',
        'font-weight': 'bold',
        'background-color': 'red',
    };
    public readonly PASSIVE_STYLE: { [key: string]: string } = {
        'color': 'lightgrey',
        'background-color': 'darkgrey',
        'font-size': 'italic',
    };
    public readonly SAFE_TIME: { [key: string]: string } = { color: 'black' };

    public style: { [key: string]: string } = this.SAFE_TIME;

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
        this.remainingTime = duration;
    }
    public changeDuration(ms: number): void {
        this.remainingTime = ms;
    }
    public start(): void {
        // duration is in ms
        display(CountDownComponent.VERBOSE, this.debugName + '.start(' + this.remainingTime + 'ms);');

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
        display(CountDownComponent.VERBOSE, this.debugName + '.resume(' + this.remainingTime + 'ms)');

        if (this.isPaused === false || this.started === false) {
            throw new Error('Should only resume chrono that are started and paused!');
        }
        this.startTime = Date.now();
        const remainingTimeOnResume: number = this.remainingTime;
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
        this.remainingTime = 0;
        this.outOfTimeAction.emit();
    }
    private countSeconds(): void {
        this.timeoutHandleSec = window.setTimeout(() => {
            this.updateShownTime();
        }, 1000);
    }
    public pause(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.pause(' + this.remainingTime + 'ms)');

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
        display(CountDownComponent.VERBOSE, this.debugName + '.stop(' + this.remainingTime + 'ms)');

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
    public getTimeStyle(): { [key: string]: string } {
        if (this.active === false) {
            return this.PASSIVE_STYLE;
        }
        if (this.remainingTime < this.dangerTimeLimit) {
            if (this.remainingTime % 2000 < 1000) {
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
        this.remainingTime -= (now - this.startTime);
        this.style = this.getTimeStyle();
        this.startTime = now;
        if (!this.isPaused) {
            this.countSeconds();
        }
    }
    private clearTimeouts(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.clearTimeouts');

        clearTimeout(this.timeoutHandleSec);
        this.timeoutHandleSec = null;

        clearTimeout(this.timeoutHandleGlobal);
        this.timeoutHandleGlobal = null;
    }
    public ngOnDestroy(): void {
        this.clearTimeouts();
    }
}
