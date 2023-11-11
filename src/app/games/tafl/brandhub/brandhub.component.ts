import { Component } from '@angular/core';
import { BrandhubMove } from 'src/app/games/tafl/brandhub/BrandhubMove';
import { BrandhubState } from './BrandhubState';
import { BrandhubRules } from './BrandhubRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove, BrandhubState> {

    public constructor(messageDisplayer: MessageDisplayer, activatedRoute: ActivatedRoute) {
        super(messageDisplayer, activatedRoute, BrandhubMove.from);
        this.setRulesAndNode('Brandhub');
        this.availableAIs = this.createAIs();
        this.encoder = BrandhubMove.encoder;
    }
}
