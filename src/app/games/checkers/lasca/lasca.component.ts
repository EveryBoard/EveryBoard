import { ChangeDetectorRef, Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { CheckersMove } from '../common/CheckersMove';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { CheckersControlMinimax } from '../common/CheckersControlMinimax';
import { CheckersControlPlusDominationMinimax } from '../common/CheckersControlPlusDominationMinimax';
import { LascaRules } from './LascaRules';
import { CheckersComponent } from '../common/checkers.component';
import { CheckersMoveGenerator } from '../common/CheckersMoveGenerator';

@Component({
    selector: 'app-lasca',
    templateUrl: '../common/checkers.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class LascaComponent extends CheckersComponent<LascaRules> {

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('Lasca');
        this.moveGenerator = new CheckersMoveGenerator(this.rules);
        this.availableAIs = [
            new CheckersControlMinimax(this.rules),
            new CheckersControlPlusDominationMinimax(this.rules),
            new MCTS($localize`MCTS`, this.moveGenerator, this.rules),
        ];
        this.encoder = CheckersMove.encoder;
        this.hasAsymmetricBoard = true;
    }

}
