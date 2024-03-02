import { ChangeDetectorRef, Component } from '@angular/core';

import { AwaleRules } from './AwaleRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { MancalaMove } from '../common/MancalaMove';
import { MancalaComponent } from '../common/MancalaComponent';

@Component({
    selector: 'app-awale-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
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
