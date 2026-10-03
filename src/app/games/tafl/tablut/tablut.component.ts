import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TablutMove } from '@everyboard/games';
import { TablutRules } from '@everyboard/games';

import { TaflComponent } from '../tafl.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-tablut',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class TablutComponent extends TaflComponent<TablutRules, TablutMove> {

    public constructor() {
        super('Tablut', TablutMove.from);
        this.aiConfig = this.createAIConfig();
        this.encoder = TablutMove.encoder;
    }
}
