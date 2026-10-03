import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AwaleMoveGenerator } from '@everyboard/games/mancala/awale';
import { AwaleRules } from '@everyboard/games/mancala/awale';
import { MancalaMove } from '@everyboard/games/mancala/common';

import { MancalaComponent } from '../common/MancalaComponent';
import { NumberedCircleComponent } from '../common/numbered-circle.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-awale-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NumberedCircleComponent],
})
export class AwaleComponent extends MancalaComponent<AwaleRules> {

    public constructor() {
        super('Awale');
        this.aiConfig = this.createAIConfig(new AwaleMoveGenerator());
        this.encoder = MancalaMove.encoder;
    }

}
