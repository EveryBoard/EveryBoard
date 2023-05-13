import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[autofocus]',
})
export class AutofocusDirective implements AfterViewInit {

    public constructor(private readonly element: ElementRef) {}

    public ngAfterViewInit(): void {
        this.element.nativeElement.focus();
    }
}
