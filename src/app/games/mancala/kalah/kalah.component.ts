import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MancalaDistribution } from '../common/MancalaMove';
import { MancalaMultipleSowComponent } from '../common/MancalaMultipleSowComponent';
import { KalahRules } from './KalahRules';
import { KalahMove } from './KalahMove';
import { KalahTutorial } from './KalahTutorial';
import { Minimax } from 'src/app/jscaip/Minimax';
import { KalahMoveGenerator } from './KalahMoveGenerator';
import { KalahScoreHeuristic } from './KalahScoreHeuristic';
import { MCTS } from 'src/app/jscaip/MCTS';

@Component({
    selector: 'app-kalah-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KalahComponent extends MancalaMultipleSowComponent<KalahRules, KalahMove> {

    public constructor(messageDisplayer: MessageDisplayer,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, cdr);
        this.rules = KalahRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new Minimax('Score', this.rules, new KalahScoreHeuristic(), new KalahMoveGenerator()),
            new MCTS('MCTS', new KalahMoveGenerator(), this.rules),
        ];
        this.encoder = KalahMove.encoder;
        this.tutorial = new KalahTutorial().tutorial;
    }
    public generateMove(x: number): KalahMove {
        return KalahMove.of(MancalaDistribution.of(x));
    }
    protected override addToMove(x: number): KalahMove {
        return this.currentMove.get().add(MancalaDistribution.of(x));
    }
}
