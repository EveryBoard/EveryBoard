import { Component, ViewContainerRef } from '@angular/core';
import { display } from 'src/app/utils/utils';

@Component({
    selector: 'app-game-includer',
    templateUrl: './game-includer.component.html',
})
export class GameIncluderComponent {

    public static VERBOSE: boolean = false;

    constructor(public viewContainerRef: ViewContainerRef) {
        display(GameIncluderComponent.VERBOSE, 'GameIncluderComponent constructor');
    }
}
