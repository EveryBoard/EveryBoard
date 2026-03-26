import { ChangeDetectorRef, Component, inject } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';

import { HnefataflMove } from './HnefataflMove';
import { HnefataflRules } from './HnefataflRules';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-hnefatafl',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgFor, NgClass, NgIf],
})
export class HnefataflComponent extends TaflComponent<HnefataflRules, HnefataflMove> {

    public constructor() {
        super(HnefataflMove.from);
        this.setRulesAndNode('Hnefatafl');
        this.availableAIs = this.createAIs();
        this.encoder = HnefataflMove.encoder;
    }
}
