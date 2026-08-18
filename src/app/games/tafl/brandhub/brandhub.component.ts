import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { BrandhubMove } from '@everyboard/games';
import { BrandhubRules } from '@everyboard/games';

import { TaflComponent } from '../tafl.component';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove> {

    public constructor() {
        super(BrandhubMove.from);
        this.setRulesAndNode('Brandhub');
        this.aiConfig = this.createAIConfig();
        this.encoder = BrandhubMove.encoder;
    }
}
