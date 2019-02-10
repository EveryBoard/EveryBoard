import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';

@Component({
	selector: 'app-count-down',
	templateUrl: './count-down.component.html'
})
export class CountDownComponent implements OnInit, OnDestroy {

	@Input() debugName: string;
	remainingTime: number;
	private timeoutHandleGlobal: number;
	private timeoutHandleSec: number;
	private isPaused = true;
	private isStarted = false;
	private startTime: number;

	@Output() outOfTimeAction = new EventEmitter<void>();

	ngOnInit() {
		console.log('cdc::ngOnInit');
	}

	start(duration: number) {
		// duration is in ms
		if (this.isStarted) {
			// it's a restart
			console.log('!!!cdc::' + this.debugName + '::start:: WHAT THE FUCK THE TIMEOUT WHERE ALREADY STARTED DUUUUDE');
			return;
		}
		console.log('cdc::' + this.debugName + '::start ' + (duration / 1000) + ' s');
		this.isStarted = true;
		this.remainingTime = duration;
		this.resume();
	}

	pause() {
		if (this.isPaused) {
			console.log('!!!cdc::' + this.debugName + '::pause:: it is already paused');
			return;
		}
		if (!this.isStarted) {
			console.log('!!!cdc::' + this.debugName + '::pause:: it is not started yet');
			return;
		}
		console.log('cdc::' + this.debugName + '::pause');
		const useFull: boolean = this.clearTimeouts();
		if (!useFull) {
			console.log('!!!cdc::' + this.debugName + '::pause SHOUDLNT HAPPEND !!!! MY DEAR SIR, why pause something not started ?');
		}
		this.isPaused = true;
		this.updateShownTime();
	}

	stop() {
		console.log('cdc::' + this.debugName + '::stop that call pause');
		this.pause();
		this.isStarted = false;
	}

	resume() {
		if (!this.isPaused) {
			console.log('!!!cdc::' + this.debugName + '::resume it is not paused, how to resume?');
			return;
		}
		console.log('cdc::' + this.debugName + '::resume for ' + this.remainingTime);
		this.startTime = Date.now();
		this.isPaused = false;
		this.timeoutHandleGlobal = setTimeout(() => {
			console.log('cdc::' + this.debugName + '::end reached');
			this.onEndReached();
		}, this.remainingTime);
		this.timeoutHandleSec = setTimeout(() => {
			this.updateShownTime();
		}, 1000);
	}

	onEndReached() {
		this.isPaused = true;
		this.isStarted = false;
		this.clearTimeouts();
		this.remainingTime = 0;
		alert('cdc::' + this.debugName + '::fini');
		this.outOfTimeAction.emit();
	}

	updateShownTime() {
		const now = Date.now();
		this.remainingTime -= (now - this.startTime);
		this.startTime = now;
		if (!this.isPaused) {
			this.timeoutHandleSec = setTimeout(() => this.updateShownTime(), 1000);
		}
	}

	clearTimeouts(): boolean {
		console.log('cdc::clearTimeouts');
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

	constructor() {
	}

	ngOnDestroy() {
		this.clearTimeouts();
	}
}
