import { Component } from '@angular/core';
import { BrandhubMove } from 'src/app/games/tafl/brandhub/BrandhubMove';
import { BrandhubState } from './BrandhubState';
import { BrandhubRules } from './BrandhubRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { BrandhubTutorial } from './BrandhubTutorial';
import { ActivatedRoute } from '@angular/router';
import { brandhubConfig } from './brandhubConfig';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove, BrandhubState> {

    public constructor(messageDisplayer: MessageDisplayer, actRoute: ActivatedRoute) {
        super(messageDisplayer, actRoute, BrandhubMove.from);
        this.rules = BrandhubRules.get();
        this.node = this.rules.getInitialNode(brandhubConfig);
        this.availableMinimaxes = this.createMinimaxes();
        this.encoder = BrandhubMove.encoder;
        this.tutorial = new BrandhubTutorial().tutorial;
    }
}
