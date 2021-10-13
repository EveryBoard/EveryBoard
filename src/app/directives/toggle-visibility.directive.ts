import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[toggleVisibility]',
})

export class ToggleVisibilityDirective {
    private shown: boolean = false;
    private input: HTMLElement;

    constructor(private el: ElementRef) {
        console.log(this.el.nativeElement);
        this.input = this.el.nativeElement.parentNode.previousSibling;
        this.el.nativeElement.addEventListener('click', (_: Event) => {
            this.toggle();
        });
    }

    private toggle() {
        this.shown = !this.shown;
        if (this.shown) {
            this.input.setAttribute('type', 'text');
        } else {
            this.input.setAttribute('type', 'password');
        }
        this.input.focus();
    }
}
