import { Component, Input } from '@angular/core';
import { BaseGameComponent } from '../game-component/GameComponent';
import { DirArrow } from './DirArrow';

@Component({
    selector: '[app-dir-arrow]',
    templateUrl: './arrow.component.svg',
    styleUrls: ['../game-component/game-component.scss'],
})
export class DirArrowComponent extends BaseGameComponent {

    @Input() arrow: DirArrow;

}
