import { Component, Input } from '@angular/core';
import { BaseGameComponent } from '../game-component/GameComponent';
import { DirArrow } from './DirArrow';

@Component({
    selector: '[app-dir-arrow]',
    templateUrl: './dir-arrow.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class DirArrowComponent extends BaseGameComponent { // implements AfterContentChecked {

    @Input() arrow: DirArrow;

}
