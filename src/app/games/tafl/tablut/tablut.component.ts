import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { TaflComponent } from '../tafl.component';

import { TablutMove } from './TablutMove';
import { TablutRules } from './TablutRules';

@Component({
    selector: 'app-tablut',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class TablutComponent extends TaflComponent<TablutRules, TablutMove> {

    public constructor() {
        super(TablutMove.from);
        this.setRulesAndNode('Tablut');
        this.availableAIs = this.createAIs();
        this.encoder = TablutMove.encoder;
    }
}
