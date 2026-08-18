import { Component } from '@angular/core';

import { MancalaMove } from '@everyboard/games';
import { AwaleMoveGenerator } from '@everyboard/games';
import { AwaleRules } from '@everyboard/games';

import { MancalaComponent } from '../common/MancalaComponent';
import { NumberedCircleComponent } from '../common/numbered-circle.component';

@Component({
    selector: 'app-awale-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NumberedCircleComponent],
})
export class AwaleComponent extends MancalaComponent<AwaleRules> {

    public constructor() {
        super();
        this.setRulesAndNode('Awale');
        this.aiConfig = this.createAIConfig(new AwaleMoveGenerator());
        this.encoder = MancalaMove.encoder;
    }

}
