import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

import { MancalaComponent } from '../common/MancalaComponent';
import { MancalaMove } from '../common/MancalaMove';
import { NumberedCircleComponent } from '../common/numbered-circle.component';

import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { AwaleRules } from './AwaleRules';

@Component({
    selector: 'app-awale-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgFor, NumberedCircleComponent],
})
export class AwaleComponent extends MancalaComponent<AwaleRules> {

    public constructor() {
        super();
        this.setRulesAndNode('Awale');
        this.availableAIs = this.createAIs(new AwaleMoveGenerator());
        this.encoder = MancalaMove.encoder;
    }

}
