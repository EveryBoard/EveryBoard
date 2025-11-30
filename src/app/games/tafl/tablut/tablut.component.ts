import { ChangeDetectorRef, Component } from '@angular/core';
import { TablutMove } from '../../tafl/tablut/TablutMove';
import { TablutRules } from './TablutRules';
import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';

@Component({
    selector: 'app-tablut',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class TablutComponent extends TaflComponent<TablutRules, TablutMove> {

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr, TablutMove.from);
        this.setRulesAndNode('Tablut');
        this.availableAIs = this.createAIs();
        this.encoder = TablutMove.encoder;
    }
}
