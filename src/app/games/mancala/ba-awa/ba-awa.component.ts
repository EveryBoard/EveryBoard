import { ChangeDetectorRef, Component } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { MancalaComponent } from '../common/MancalaComponent';
import { MancalaMove } from '../common/MancalaMove';

import { BaAwaMoveGenerator } from './BaAwaMoveGenerator';
import { BaAwaRules } from './BaAwaRules';

@Component({
    selector: 'app-ba-awa-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    standalone: false
})
export class BaAwaComponent extends MancalaComponent<BaAwaRules> {

    public constructor(messageDisplayer: MessageDisplayer,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('BaAwa');
        this.availableAIs = this.createAIs(new BaAwaMoveGenerator());
        this.encoder = MancalaMove.encoder;
    }

}
