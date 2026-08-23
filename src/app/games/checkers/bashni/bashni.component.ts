import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BashniRules } from '@everyboard/games';

import { CheckersComponent } from '../common/checkers.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-bashni',
    templateUrl: '../common/checkers.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class BashniComponent extends CheckersComponent<BashniRules> {

    public constructor() {
        super('Bashni');
    }

}
