import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
    selector: '[appGameIncluder]',
})
export class GameIncluderDirective {

    public static VERBOSE: boolean = false;

    constructor(public viewContainerRef: ViewContainerRef) {

        if(GameIncluderDirective.VERBOSE) console.log("GameIncluderDirective.constructor");
    }
}
