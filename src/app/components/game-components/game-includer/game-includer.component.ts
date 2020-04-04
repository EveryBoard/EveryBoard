import {Component, ViewContainerRef } from '@angular/core';

@Component({
	selector: 'app-game-includer',
	templateUrl: './game-includer.component.html'
})
export class GameIncluderComponent {

    constructor(public viewContainerRef: ViewContainerRef) {}
}