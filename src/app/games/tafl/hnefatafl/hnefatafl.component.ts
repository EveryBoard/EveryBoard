import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { TaflComponent } from '../tafl.component';

import { HnefataflMove } from './HnefataflMove';
import { HnefataflRules } from './HnefataflRules';

@Component({
    selector: 'app-hnefatafl',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class HnefataflComponent extends TaflComponent<HnefataflRules, HnefataflMove> {

    public constructor() {
        super(HnefataflMove.from);
        this.setRulesAndNode('Hnefatafl');
        this.availableAIs = this.createAIs();
        this.encoder = HnefataflMove.encoder;
    }
}
