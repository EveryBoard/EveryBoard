import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HnefataflMove } from 'src/app/games/tafl/hnefatafl/HnefataflMove';
import { HnefataflRules } from './HnefataflRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';

@Component({
    selector: 'app-hnefatafl',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class HnefataflComponent extends TaflComponent<HnefataflRules, HnefataflMove> {

    public constructor(messageDisplayer: MessageDisplayer, activatedRoute: ActivatedRoute) {
        super(messageDisplayer, activatedRoute, HnefataflMove.from);
        this.setRulesAndNode('Hnefatafl');
        this.availableAIs = this.createAIs();
        this.encoder = HnefataflMove.encoder;
    }
}
