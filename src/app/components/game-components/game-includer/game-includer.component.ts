import {Component, OnInit, ViewContainerRef, AfterViewInit, AfterContentInit} from '@angular/core';

@Component({
	selector: 'app-game-includer',
	templateUrl: './game-includer.component.html'
})
export class GameIncluderComponent implements OnInit, AfterViewInit, AfterContentInit {

    public VERBOSE: boolean = false;

    constructor(public viewContainerRef: ViewContainerRef) {
		if (this.VERBOSE) console.log('Game Includer Constructed: '+(this.viewContainerRef!=null));
	}
	public ngOnInit() {
		if (this.VERBOSE) console.log('Game Includer Initialised'+(this.viewContainerRef!=null));
    }
    public ngAfterContentInit() {
        if (this.VERBOSE) console.log("Game Includer after CONTENT Initialised"+(this.viewContainerRef!=null));
    }
    public ngAfterViewInit() {
        if (this.VERBOSE) console.log("Game Includer After View Initialised"+(this.viewContainerRef!=null));
    }
}