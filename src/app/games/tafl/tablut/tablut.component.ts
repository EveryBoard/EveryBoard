import { NgFor, NgClass, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';

import { TablutMove } from './TablutMove';
import { TablutRules } from './TablutRules';

@Component({
    selector: 'app-tablut',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgFor, NgClass, NgIf],
})
export class TablutComponent extends TaflComponent<TablutRules, TablutMove> {

    public constructor() {
        super(TablutMove.from);
        this.setRulesAndNode('Tablut');
        this.availableAIs = this.createAIs();
        this.encoder = TablutMove.encoder;
    }
}
