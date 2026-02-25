import { Component, Input } from '@angular/core';

import { HexaDirection } from '../../../jscaip/HexaDirection';
import { BaseGameComponent } from '../base-game-component/BaseGameComponent';

import { Arrow } from './Arrow';

@Component({
    selector: '[app-hex-arrow]',
    templateUrl: './arrow.component.svg',
    styleUrls: ['../game-component/game-component.scss'],
})
export class HexArrowComponent extends BaseGameComponent {

    @Input() arrow: Arrow<HexaDirection>;

}
