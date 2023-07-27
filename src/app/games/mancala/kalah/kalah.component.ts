import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MancalaComponent } from '../commons/MancalaComponent';
import { KalahRules } from './KalahRules';
import { KalahMove } from './KalahMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
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
export class KalahComponent extends MancalaComponent<KalahRules, KalahMove> {

    public override readonly multipleDistribution: boolean = true;

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
    protected override addToMove(x: number): MGPOptional<KalahMove> {
        return MGPOptional.of(this.currentMove.get().add(MancalaDistribution.of(x)));
    }
}
