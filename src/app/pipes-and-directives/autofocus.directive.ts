import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
    selector: '[autofocus]',
})
export class AutofocusDirective implements OnInit {

    public constructor(private readonly element: ElementRef) {}

    public ngOnInit(): void {
        // focus need to be called after a bit, otherwise it doesn't do anything.
        // 0ms is enough, just to get in the next event loop
        window.setTimeout(() => {
            this.element.nativeElement.focus();
        }, 1);
    }
}
