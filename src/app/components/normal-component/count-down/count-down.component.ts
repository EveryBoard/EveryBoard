import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';

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
        if (CountDownComponent.VERBOSE) {
            console.log('CountDownComponent ngOnInit (' + this.debugName + ')');
        }
    }
    public start(duration: number) {
        // duration is in ms
        if (this.isStarted) {
            throw new Error("CountDownComponent.start should not be called while already started");
        }
        if (CountDownComponent.VERBOSE) {
            console.log('cdc::' + this.debugName + '::start ' + (duration / 1000) + ' s');
        }
        this.isStarted = true;
        this.remainingTime = duration;
        this.resume();
    }
    public pause() {
        if (this.isPaused) {
            if (CountDownComponent.VERBOSE) {
                console.log('!!!cdc::' + this.debugName + '::pause:: it is already paused');
            }
            return;
        }
        if (!this.isStarted) {
            if (CountDownComponent.VERBOSE) {
                console.log('!!!cdc::' + this.debugName + '::pause:: it is not started yet');
            }
            return;
        }
        if (CountDownComponent.VERBOSE) {
            console.log('cdc::' + this.debugName + '::pause');
        }
        const started: boolean = this.clearTimeouts();
        if (!started) {
            throw new Error("Cannot pause unstarted CountDown");
        }
        this.isPaused = true;
        this.updateShownTime();
    }
    public stop() {
        if (CountDownComponent.VERBOSE) {
            console.log('cdc::' + this.debugName + '::stop that call pause');
        }
        this.pause();
        this.isStarted = false;
    }
    public resume() {
        if (!this.isPaused) {
            if (CountDownComponent.VERBOSE) {
                console.log('!!!cdc::' + this.debugName + '::resume it is not paused, how to resume?');
            }
            return;
        }
        if (CountDownComponent.VERBOSE) {
            console.log('cdc::' + this.debugName + '::resume for ' + this.remainingTime);
        }
        this.startTime = Date.now();
        this.isPaused = false;
        this.timeoutHandleGlobal = window.setTimeout(() => {
            if (CountDownComponent.VERBOSE) {
                console.log('cdc::' + this.debugName + '::end reached');
            }
            this.onEndReached();
        }, this.remainingTime);
        this.timeoutHandleSec = window.setTimeout(() => {
            this.updateShownTime();
        }, 1000);
    }
    public onEndReached() {
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
        if (CountDownComponent.VERBOSE) {
            console.log('cdc::clearTimeouts');
        }
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