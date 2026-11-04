import { Component, input, InputSignal, ChangeDetectionStrategy } from '@angular/core';

import { HexaDirection } from '@everyboard/games';

import { BaseGameComponent } from '../base-game-component/BaseGameComponent';

import { Arrow } from './Arrow';

@Component({
    selector: '[app-hex-arrow]',
    templateUrl: './arrow.component.svg',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['../game-component/game-component.scss'],
})
export class HexArrowComponent extends BaseGameComponent {

    public readonly arrow: InputSignal<Arrow<HexaDirection>> = input.required<Arrow<HexaDirection>>();

}
