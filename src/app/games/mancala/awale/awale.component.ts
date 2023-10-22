import { ChangeDetectorRef, Component } from '@angular/core';

import { AwaleRules } from './AwaleRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ActivatedRoute } from '@angular/router';
import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { KalahMove } from '../kalah/KalahMove';
import { MancalaDistribution } from '../common/MancalaMove';
import { MancalaMultipleSowComponent } from '../common/MancalaMultipleSowComponent';

@Component({
    selector: 'app-awale-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class AwaleComponent extends MancalaMultipleSowComponent<AwaleRules, KalahMove> {

    public constructor(messageDisplayer: MessageDisplayer,
                       activatedRoute: ActivatedRoute,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, activatedRoute, cdr);
        this.setRuleAndNode('Awale');
        this.availableAIs = this.createAIs(new AwaleMoveGenerator());
        this.encoder = KalahMove.encoder;
    }

    public generateMove(x: number): KalahMove {
        return KalahMove.of(MancalaDistribution.of(x));
    }

    protected override addToMove(x: number): KalahMove {
        return this.currentMove.get().add(MancalaDistribution.of(x));
    }

}
