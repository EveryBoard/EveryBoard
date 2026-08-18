import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TaflComponent } from '../tafl.component';

import { TablutMove } from './TablutMove';
import { TablutRules } from './TablutRules';

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
