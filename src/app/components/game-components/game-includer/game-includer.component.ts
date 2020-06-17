import {Component, ViewContainerRef } from '@angular/core';

@Component({
    selector: 'app-game-includer',
    templateUrl: './game-includer.component.html'
})
export class GameIncluderComponent {

    public static VERBOSE: boolean = false;

    constructor(public viewContainerRef: ViewContainerRef) {
        if (GameIncluderComponent.VERBOSE)
            console.log("GameIncluderComponent constructor");
    }
}