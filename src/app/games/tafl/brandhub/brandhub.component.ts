import { ChangeDetectorRef, Component } from '@angular/core';
import { BrandhubMove } from 'src/app/games/tafl/brandhub/BrandhubMove';
import { BrandhubRules } from './BrandhubRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove> {

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr, BrandhubMove.from);
        this.setRulesAndNode('Brandhub');
        this.availableAIs = this.createAIs();
        this.encoder = BrandhubMove.encoder;
    }
}
