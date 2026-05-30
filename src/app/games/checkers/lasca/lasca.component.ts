import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { CheckersComponent } from '../common/checkers.component';

import { LascaRules } from './LascaRules';

@Component({
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
