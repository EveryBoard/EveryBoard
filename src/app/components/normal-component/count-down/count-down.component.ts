import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';

@Component({
	selector: 'app-count-down',
	templateUrl: './count-down.component.html',
	styleUrls: ['./count-down.component.css']
})
export class CountDownComponent implements OnInit, OnDestroy {

	private ended = false;

	@Input() initialDuration: number;
	@Input() duration: number;
	@Input() paused: boolean;
	@Input() autoRefill: boolean;

	@Output() outOfTimeAction = new EventEmitter<void>();

	constructor() {
	}

	ngOnInit() {
		this.decDuration();
	}

	decDuration() {
		console.log(' decrementing : ' + this.duration);
		if (!this.paused) {
			this.duration = this.duration - 1;
			if (this.duration <= 0) {
				this.ended = true;
				this.outOfTimeAction.emit();
			}
		} else if (this.autoRefill) {
				this.duration = this.initialDuration;
		}
		if (!this.ended) {
			setTimeout(() => this.decDuration(),
				1000);
		}
	}

	ngOnDestroy() {
		this.ended = true;
	}
}
