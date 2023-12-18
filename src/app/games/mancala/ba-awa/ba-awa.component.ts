import { ChangeDetectorRef, Component } from '@angular/core';

import { BaAwaRules } from './BaAwaRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MancalaMove } from '../common/MancalaMove';
import { MancalaComponent } from '../common/MancalaComponent';
import { BaAwaMoveGenerator } from './BaAwaMoveGenerator';

@Component({
    selector: 'app-ba-awa-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
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
