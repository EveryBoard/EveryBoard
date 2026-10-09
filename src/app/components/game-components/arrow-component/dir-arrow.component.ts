import { Component, input, InputSignal } from '@angular/core';

import { Ordinal } from '@everyboard/games';

import { BaseGameComponent } from '../base-game-component/BaseGameComponent';

import { Arrow } from './Arrow';

@Component({
    selector: '[app-dir-arrow]',
    templateUrl: './arrow.component.svg',
    styleUrls: ['../game-component/game-component.scss'],
})
export class DirArrowComponent extends BaseGameComponent {

    public readonly arrow: InputSignal<Arrow<Ordinal>> = input.required<Arrow<Ordinal>>();

}
