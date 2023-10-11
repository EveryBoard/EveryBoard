import { Component } from '@angular/core';
import { HnefataflMove } from 'src/app/games/tafl/hnefatafl/HnefataflMove';
import { HnefataflRules } from './HnefataflRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { HnefataflTutorial } from './HnefataflTutorial';
import { TaflState } from '../TaflState';

@Component({
    selector: 'app-hnefatafl',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class HnefataflComponent extends TaflComponent<HnefataflRules, HnefataflMove, TaflState> {

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer, HnefataflMove.from);
        this.rules = HnefataflRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = this.createAIs();
        this.encoder = HnefataflMove.encoder;
        this.tutorial = new HnefataflTutorial().tutorial;
    }
}
