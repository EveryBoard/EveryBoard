import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LascaRules } from '@everyboard/games';

import { CheckersComponent } from '../common/checkers.component';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-lasca',
    templateUrl: '../common/checkers.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class LascaComponent extends CheckersComponent<LascaRules> {

    public constructor() {
        super('Lasca');
    }

}
