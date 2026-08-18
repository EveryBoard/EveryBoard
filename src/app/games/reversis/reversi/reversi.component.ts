import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AbstractReversiComponent } from '../common/abstract-reversi.component';

import { ReversiRules } from './ReversiRules';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-reversi',
    templateUrl: '../common/abstract-reversi.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class ReversiComponent extends AbstractReversiComponent<ReversiRules> {

    public constructor() {
        super('Reversi');
    }

}
