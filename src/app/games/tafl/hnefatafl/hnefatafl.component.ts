import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HnefataflMove } from '@everyboard/games';
import { HnefataflRules } from '@everyboard/games';

import { TaflComponent } from '../tafl.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-hnefatafl',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class HnefataflComponent extends TaflComponent<HnefataflRules, HnefataflMove> {

    public constructor() {
        super('Hnefatafl', HnefataflMove.from);
        this.aiConfig = this.createAIConfig();
        this.encoder = HnefataflMove.encoder;
    }
}
