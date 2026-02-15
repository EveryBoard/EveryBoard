import { ChangeDetectorRef, Component } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { MancalaComponent } from '../common/MancalaComponent';
import { MancalaMove } from '../common/MancalaMove';
import { KalahMoveGenerator } from './KalahMoveGenerator';
import { KalahRules } from './KalahRules';

@Component({
    selector: 'app-kalah-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class KalahComponent extends MancalaComponent<KalahRules> {

    public constructor(messageDisplayer: MessageDisplayer,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('Kalah');
        this.availableAIs = this.createAIs(new KalahMoveGenerator());
        this.encoder = MancalaMove.encoder;
    }

}
