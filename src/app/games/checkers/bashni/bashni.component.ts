import { ChangeDetectorRef, Component } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { CheckersComponent } from '../common/checkers.component';

import { BashniRules } from './BashniRules';

@Component({
    selector: 'app-bashni',
    templateUrl: '../common/checkers.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class BashniComponent extends CheckersComponent<BashniRules> {

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('Bashni');
    }

}
