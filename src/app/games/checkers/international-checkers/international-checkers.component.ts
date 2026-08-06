import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { CheckersComponent } from '../common/checkers.component';

import { InternationalCheckersRules } from './InternationalCheckersRules';

@Component({
    selector: 'app-international-checkers',
    templateUrl: '../common/checkers.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class InternationalCheckersComponent extends CheckersComponent<InternationalCheckersRules> {

    public constructor() {
        super();
        this.setRulesAndNode('InternationalCheckers');
    }

}
