import { ChangeDetectorRef, Component } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { CheckersComponent } from '../common/checkers.component';

import { InternationalCheckersRules } from './InternationalCheckersRules';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-international-checkers',
    templateUrl: '../common/checkers.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgFor, NgClass, NgIf]
})
export class InternationalCheckersComponent extends CheckersComponent<InternationalCheckersRules> {

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('InternationalCheckers');
    }

}
