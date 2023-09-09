import { ChangeDetectorRef, Component } from '@angular/core';
import { AwaleRules } from './AwaleRules';
import { AwaleMove } from './AwaleMove';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { AwaleTutorial } from './AwaleTutorial';
import { MancalaSingleSowComponent } from '../common/MancalaSingleSowComponent';
import { Minimax } from 'src/app/jscaip/Minimax';
import { AwaleOrderedMoveGenerator } from './AwaleOrderedMoveGenerator';
import { AwaleScoreHeuristic } from './AwaleScoreHeuristic';
import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { MCTS } from 'src/app/jscaip/MCTS';

@Component({
    selector: 'app-awale-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class AwaleComponent extends MancalaSingleSowComponent<AwaleRules, AwaleMove> {

    public constructor(messageDisplayer: MessageDisplayer,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, cdr);
        this.rules = AwaleRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new Minimax('Score', this.rules, new AwaleScoreHeuristic(), new AwaleOrderedMoveGenerator()),
            new MCTS('MCTS', new AwaleMoveGenerator(), this.rules),
        ];
        this.encoder = AwaleMove.encoder;
        this.tutorial = new AwaleTutorial().tutorial;
    }
    public generateMove(x: number): AwaleMove {
        return AwaleMove.of(x);
    }
}
