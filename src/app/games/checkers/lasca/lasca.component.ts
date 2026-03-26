import { ChangeDetectorRef, Component } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { CheckersComponent } from '../common/checkers.component';

import { LascaRules } from './LascaRules';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-lasca',
    templateUrl: '../common/checkers.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgFor, NgClass, NgIf]
})
export class LascaComponent extends CheckersComponent<LascaRules> {

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('Lasca');
    }

}
