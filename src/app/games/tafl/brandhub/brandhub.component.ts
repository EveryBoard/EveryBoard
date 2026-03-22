import { ChangeDetectorRef, Component } from '@angular/core';

import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';

import { BrandhubMove } from './BrandhubMove';
import { BrandhubRules } from './BrandhubRules';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    standalone: false
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove> {

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr, BrandhubMove.from);
        this.setRulesAndNode('Brandhub');
        this.availableAIs = this.createAIs();
        this.encoder = BrandhubMove.encoder;
    }
}
