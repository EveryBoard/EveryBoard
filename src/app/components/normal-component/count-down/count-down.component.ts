import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { display } from 'src/app/utils/collection-lib/utils';

@Component({
    selector: 'app-count-down',
    templateUrl: './count-down.component.html',
})
export class CountDownComponent implements OnInit, OnDestroy {
    public static VERBOSE: boolean = true;

    @Input() debugName: string;
    remainingTime: number;
    private timeoutHandleGlobal: number;
    private timeoutHandleSec: number;
    private isPaused: boolean = true;
    private isStarted: boolean = false;
    private startTime: number;

    @Output() outOfTimeAction: EventEmitter<void> = new EventEmitter<void>();

    public ngOnInit(): void {
        display(CountDownComponent.VERBOSE, 'CountDownComponent.ngOnInit (' + this.debugName + ')');
    }
    public setDuration(duration: number): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.set(' + duration + 'ms)');
        // duration is in ms
        if (this.isStarted) {
            console.log("Should not set a chrono that has already been started!")
            throw new Error('Should not set a chrono that has already been started!');
        }
        this.remainingTime = duration;
    }
    public start(): void {
        // duration is in ms
        display(CountDownComponent.VERBOSE, this.debugName + '.start(' + 1000 + 'ms);');

        if (this.remainingTime == null) {
            throw new Error('Should not start a chrono that has not been set!');
        }
        if (this.isStarted) {
            throw new Error('Should not start chrono that has already been started (' + this.debugName + ')');
        }
        this.isStarted = true;
        this.resume();
    }
    public pause(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.pause(' + (this.remainingTime/1000) + ')');

        if (!this.isStarted) {
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

        if (this.isStarted === false) {
            throw new Error('Should only stop chrono that are started!');
        }
        this.pause();
        this.isStarted = false;
        this.remainingTime = null;
    }
    public resume(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.resume(' + this.remainingTime + 'ms)');

        if (this.isPaused === false || this.isStarted === false) {
            throw new Error('Should only resume chrono that are started and paused!');
        }
        this.startTime = Date.now();
        this.isPaused = false;
        this.timeoutHandleGlobal = window.setTimeout(() => {
            console.log('END REACHED OF ' + this.debugName);
            this.onEndReached();
        }, this.remainingTime);

        this.countSeconds();
    }
    private countSeconds(): void {
        this.timeoutHandleSec = window.setTimeout(() => {
            this.updateShownTime();
        }, 1000);
    }
    private onEndReached(): void {
        display(CountDownComponent.VERBOSE, this.debugName + '.onEndReached');

        this.isPaused = true;
        this.isStarted = false;
        this.clearTimeouts();
        this.remainingTime = 0;
        this.outOfTimeAction.emit();
    }
    private updateShownTime(): void {
        const now: number = Date.now();
        this.remainingTime -= (now - this.startTime);
        this.startTime = now;
        if (!this.isPaused) {
            this.countSeconds();
        }
    }
    public clearTimeouts(): void {
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
