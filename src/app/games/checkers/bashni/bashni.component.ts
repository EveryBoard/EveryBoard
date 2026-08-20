import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CheckersComponent } from '../common/checkers.component';

import { BashniRules } from './BashniRules';

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
