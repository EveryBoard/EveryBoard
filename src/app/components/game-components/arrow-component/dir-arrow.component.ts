import { Component, Input } from '@angular/core';

import { Ordinal } from '../../../jscaip/Ordinal';
import { BaseGameComponent } from '../base-game-component/BaseGameComponent';

import { Arrow } from './Arrow';

@Component({
    selector: '[app-dir-arrow]',
    templateUrl: './arrow.component.svg',
    styleUrls: ['../game-component/game-component.scss'],
    standalone: false
})
export class DirArrowComponent extends BaseGameComponent {

    @Input() arrow: Arrow<Ordinal>;

}
