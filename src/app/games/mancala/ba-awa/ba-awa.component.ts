import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaAwaMoveGenerator } from '@everyboard/games/ba-awa';
import { BaAwaRules } from '@everyboard/games/ba-awa';
import { MancalaMove } from '@everyboard/games/ba-awa';

import { MancalaComponent } from '../common/MancalaComponent';
import { NumberedCircleComponent } from '../common/numbered-circle.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-ba-awa-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NumberedCircleComponent],
})
export class BaAwaComponent extends MancalaComponent<BaAwaRules> {

    public constructor()
    {
        super('BaAwa');
        this.aiConfig = this.createAIConfig(new BaAwaMoveGenerator());
        this.encoder = MancalaMove.encoder;
    }

}
