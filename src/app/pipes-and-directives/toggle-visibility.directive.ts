import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[toggleVisibility]',
})

export class ToggleVisibilityDirective {

    private shown: boolean = false;
    private readonly input: HTMLElement;

    public constructor(element: ElementRef) {
        this.input = element.nativeElement.parentNode.previousSibling;
        element.nativeElement.addEventListener('click', (_: Event) => {
            this.toggle();
        });
    }

    private toggle(): void {
        this.shown = this.shown === false;
        if (this.shown) {
            this.input.setAttribute('type', 'text');
        } else {
            this.input.setAttribute('type', 'password');
        }
        this.input.focus();
    }
}
