import {Component, OnInit, ViewContainerRef} from '@angular/core';

@Component({
	selector: 'app-game-includer',
	templateUrl: './game-includer.component.html'
})
export class GameIncluderComponent implements OnInit {

	constructor(public viewContainerRef: ViewContainerRef) {
		// console.log('Game Includer Constructed');
	}

	ngOnInit() {
		// console.log('Game Includer Initialised');
	}

}
