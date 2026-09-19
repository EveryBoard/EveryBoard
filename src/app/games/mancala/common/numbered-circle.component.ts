import { NgClass } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';

import { MGPOptional } from '@everyboard/lib';

@Component({
    selector: '[app-numbered-circle]',
    templateUrl: './numbered-circle.component.svg',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class NumberedCircleComponent {

    public readonly x: InputSignal<number> = input.required<number>();
    public readonly y: InputSignal<number> = input.required<number>();
    public readonly spaceClasses: InputSignal<string[]> = input.required<string[]>();
    public readonly content: InputSignal<number> = input.required<number>();
    public readonly secondaryContent: InputSignal<MGPOptional<string>> = input.required<MGPOptional<string>>();
    public readonly rotation: InputSignal<string> = input.required<string>();
}
