import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { display } from 'src/app/collectionlib/utils';

@Component({
    selector: 'app-count-down',
    templateUrl: './count-down.component.html'
})
export class CountDownComponent implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    @Input() debugName: string;
    remainingTime: number;
    private timeoutHandleGlobal: number;
    private timeoutHandleSec: number;
    private isPaused = true;
    private isStarted = false;
    private startTime: number;

    @Output() outOfTimeAction = new EventEmitter<void>();

    public ngOnInit() {
        display(CountDownComponent.VERBOSE, 'CountDownComponent.ngOnInit (' + this.debugName + ')');
    }
    public start(duration: number) {
        // duration is in ms
        display(CountDownComponent.VERBOSE, "CountDownComponent." + this.debugName + ".start(" + (duration/1000) + "s);");

        if (this.isStarted) {
            throw new Error("CountDownComponent.start should not be called while already started (" + this.debugName + ")");
        }
        this.isStarted = true;
        this.remainingTime = duration;
        this.resume();
    }
    public pause() {
        display(CountDownComponent.VERBOSE, "CountDownComponent." + this.debugName + ".pause");

        if (this.isPaused) {
            display(CountDownComponent.VERBOSE, "CountDownComponent." + this.debugName + ".pause: it is already paused");
            return;
        }
        if (!this.isStarted) {
            display(CountDownComponent.VERBOSE, "CountDownComponent." + this.debugName + ".pause: it is not started yet");
            return;
        }
        const started: boolean = this.clearTimeouts();
        if (!started) {
            throw new Error("Cannot pause unstarted CountDown (" + this.debugName + ")");
        }
        this.isPaused = true;
        this.updateShownTime();
    }
    public stop() {
        display(CountDownComponent.VERBOSE, 'CountDownComponent.' + this.debugName + '.stop');

        this.pause();
        this.isStarted = false;
    }
    public resume() {
        display(CountDownComponent.VERBOSE, 'CountDownComponent.' + this.debugName + '.resume');

        if (!this.isPaused) {
            display(CountDownComponent.VERBOSE, '!!!cdc::' + this.debugName + '::resume it is not paused, how to resume?');
            return;
        }
        this.startTime = Date.now();
        this.isPaused = false;
        this.timeoutHandleGlobal = window.setTimeout(() => {
            this.onEndReached();
        }, this.remainingTime);
        this.timeoutHandleSec = window.setTimeout(() => {
            this.updateShownTime();
        }, 1000);
    }
    public onEndReached() {
        display(CountDownComponent.VERBOSE, 'CountDownComponent.' + this.debugName + '.onEndReached');

        this.isPaused = true;
        this.isStarted = false;
        this.clearTimeouts();
        this.remainingTime = 0;
        if (CountDownComponent.VERBOSE) {
            alert('cdc::' + this.debugName + '::fini');
        }
        this.outOfTimeAction.emit();
    }
    public updateShownTime() {
        const now = Date.now();
        this.remainingTime -= (now - this.startTime);
        this.startTime = now;
        if (!this.isPaused) {
            this.timeoutHandleSec = window.setTimeout(() => this.updateShownTime(), 1000);
        }
    }
    public clearTimeouts(): boolean {
        display(CountDownComponent.VERBOSE, 'CountDownComponent.' + this.debugName + '.clearTimeouts');

        let useFull = false;
        if (this.timeoutHandleSec) {
            clearTimeout(this.timeoutHandleSec);
            this.timeoutHandleSec = null;
            useFull = true;
        }
        if (this.timeoutHandleGlobal) {
            clearTimeout(this.timeoutHandleGlobal);
            this.timeoutHandleGlobal = null;
            useFull = true;
        }
        return useFull;
    }
    public ngOnDestroy() {
        this.clearTimeouts();
    }
}