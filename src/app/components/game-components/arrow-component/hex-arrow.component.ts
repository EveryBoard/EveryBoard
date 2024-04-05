import { Component, Input } from '@angular/core';
import { BaseGameComponent } from '../game-component/GameComponent';
import { HexArrow } from './HexaDirArrow';

@Component({
    selector: '[app-hex-arrow]',
    templateUrl: './arrow.component.svg',
    styleUrls: ['../game-component/game-component.scss'],
})
export class HexArrowComponent extends BaseGameComponent {

    @Input() arrow: HexArrow;

}
