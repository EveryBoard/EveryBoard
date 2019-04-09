import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
	selector: '[appGameIncluder]',
})
export class GameIncluderDirective {
	constructor(public viewContainerRef: ViewContainerRef) {
	}
}
