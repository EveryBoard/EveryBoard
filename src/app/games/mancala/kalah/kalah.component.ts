import { Component } from '@angular/core';

import { MancalaComponent } from '../common/MancalaComponent';
import { MancalaMove } from '../common/MancalaMove';

import { KalahMoveGenerator } from './KalahMoveGenerator';
import { KalahRules } from './KalahRules';
import { NgFor } from '@angular/common';
import { NumberedCircleComponent } from '../common/numbered-circle.component';

@Component({
    selector: 'app-kalah-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgFor, NumberedCircleComponent]
})
export class KalahComponent extends MancalaComponent<KalahRules> {

    public constructor() {
        super();
        this.setRulesAndNode('Kalah');
        this.availableAIs = this.createAIs(new KalahMoveGenerator());
        this.encoder = MancalaMove.encoder;
    }

}
