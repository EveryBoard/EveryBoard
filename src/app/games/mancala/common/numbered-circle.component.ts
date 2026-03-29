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

    readonly x: InputSignal<number> = input.required<number>();
    readonly y: InputSignal<number> = input.required<number>();
    readonly spaceClasses: InputSignal<string[]> = input.required<string[]>();
    readonly content: InputSignal<number> = input.required<number>();
    readonly secondaryContent: InputSignal<MGPOptional<string>> = input.required<MGPOptional<string>>();
    readonly rotation: InputSignal<string> = input.required<string>();
}
