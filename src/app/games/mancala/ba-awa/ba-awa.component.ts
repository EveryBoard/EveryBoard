import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MancalaComponent } from '../common/MancalaComponent';
import { MancalaMove } from '../common/MancalaMove';
import { NumberedCircleComponent } from '../common/numbered-circle.component';

import { BaAwaMoveGenerator } from './BaAwaMoveGenerator';
import { BaAwaRules } from './BaAwaRules';

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
