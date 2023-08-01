import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MancalaMultipleSowComponent } from '../commons/MancalaMultipleSowComponent';
import { KalahRules } from './KalahRules';
import { KalahMove } from './KalahMove';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { KalahDummyMinimax } from './KalahDummyMinimax';
import { KalahTutorial } from './KalahTutorial';
import { MancalaDistribution } from '../commons/MancalaMove';

@Component({
    selector: 'app-kalah-component',
    templateUrl: './../commons/mancala.component.html',
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
        this.availableMinimaxes = [
            new KalahDummyMinimax(),
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
