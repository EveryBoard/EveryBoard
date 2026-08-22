import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ReversiRules } from '@everyboard/games';

import { AbstractReversiComponent } from '../common/abstract-reversi.component';


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
