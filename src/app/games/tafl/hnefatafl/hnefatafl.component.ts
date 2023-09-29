import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HnefataflMove } from 'src/app/games/tafl/hnefatafl/HnefataflMove';
import { HnefataflState } from './HnefataflState';
import { HnefataflRules } from './HnefataflRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { HnefataflTutorial } from './HnefataflTutorial';

@Component({
    selector: 'app-hnefatafl',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class HnefataflComponent extends TaflComponent<HnefataflRules, HnefataflMove, HnefataflState> {

    public constructor(messageDisplayer: MessageDisplayer, actRoute: ActivatedRoute) {
        super(messageDisplayer, actRoute, HnefataflMove.from);
        this.rules = HnefataflRules.get();
        this.node = this.rules.getInitialNode(HnefataflRules.DEFAULT_CONFIG);
        this.availableAIs = this.createAIs();
        this.encoder = HnefataflMove.encoder;
        this.tutorial = new HnefataflTutorial().tutorial;
    }
}
