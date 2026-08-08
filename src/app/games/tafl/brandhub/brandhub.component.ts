import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { TaflComponent } from '../tafl.component';

import { BrandhubMove } from './BrandhubMove';
import { BrandhubRules } from './BrandhubRules';

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
