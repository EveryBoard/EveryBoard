import { Component, Input } from '@angular/core';
import { BaseGameComponent } from '../game-component/GameComponent';
import { Arrow } from './Arrow';
import { Ordinal } from 'src/app/jscaip/Ordinal';

@Component({
    selector: '[app-dir-arrow]',
    templateUrl: './arrow.component.svg',
    styleUrls: ['../game-component/game-component.scss'],
})
export class DirArrowComponent extends BaseGameComponent {

    @Input() arrow: Arrow<Ordinal>;

}
