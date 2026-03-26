import { ChangeDetectorRef, Component } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { MancalaComponent } from '../common/MancalaComponent';
import { MancalaMove } from '../common/MancalaMove';

import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { AwaleRules } from './AwaleRules';
import { NgFor } from '@angular/common';
import { NumberedCircleComponent } from '../common/numbered-circle.component';

@Component({
    selector: 'app-awale-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgFor, NumberedCircleComponent]
})
export class AwaleComponent extends MancalaComponent<AwaleRules> {

    public constructor(messageDisplayer: MessageDisplayer,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('Awale');
        this.availableAIs = this.createAIs(new AwaleMoveGenerator());
        this.encoder = MancalaMove.encoder;
    }

}
