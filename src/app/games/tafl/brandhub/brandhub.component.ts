import { ChangeDetectorRef, Component, inject } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';

import { BrandhubMove } from './BrandhubMove';
import { BrandhubRules } from './BrandhubRules';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgFor, NgClass, NgIf],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove> {

    public constructor() {
        super(BrandhubMove.from);
        this.setRulesAndNode('Brandhub');
        this.availableAIs = this.createAIs();
        this.encoder = BrandhubMove.encoder;
    }
}
