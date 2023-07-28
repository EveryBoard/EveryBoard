import { Component } from '@angular/core';
import { TablutMove } from 'src/app/games/tafl/tablut/TablutMove';
import { TablutState } from './TablutState';
import { TablutRules } from './TablutRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TablutTutorial } from './TablutTutorial';
import { TaflComponent } from '../tafl.component';

@Component({
    selector: 'app-tablut',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class TablutComponent extends TaflComponent<TablutRules, TablutMove, TablutState> {

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer, false, TablutMove.from);
        this.rules = TablutRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = this.createMinimaxes();
        this.encoder = TablutMove.encoder;
        this.tutorial = new TablutTutorial().tutorial;
        void this.updateBoard();
    }
}
