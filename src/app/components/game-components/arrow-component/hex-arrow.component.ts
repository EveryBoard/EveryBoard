import { Component, Input } from '@angular/core';
import { BaseGameComponent } from '../game-component/GameComponent';
import { Arrow } from './Arrow';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';

@Component({
    selector: '[app-hex-arrow]',
    templateUrl: './arrow.component.svg',
    styleUrls: ['../game-component/game-component.scss'],
})
export class HexArrowComponent extends BaseGameComponent {

    @Input() arrow: Arrow<HexaDirection>;

}
