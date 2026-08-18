import { Component } from '@angular/core';

import { MancalaMove } from '@everyboard/games';
import { KalahMoveGenerator } from '@everyboard/games';
import { KalahRules } from '@everyboard/games';

import { MancalaComponent } from '../common/MancalaComponent';
import { NumberedCircleComponent } from '../common/numbered-circle.component';

@Component({
    selector: 'app-kalah-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NumberedCircleComponent],
})
export class KalahComponent extends MancalaComponent<KalahRules> {

    public constructor() {
        super();
        this.setRulesAndNode('Kalah');
        this.aiConfig = this.createAIConfig(new KalahMoveGenerator());
        this.encoder = MancalaMove.encoder;
    }

}
