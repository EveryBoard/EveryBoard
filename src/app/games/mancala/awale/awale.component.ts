import { ChangeDetectorRef, Component } from '@angular/core';
import { AwaleRules } from './AwaleRules';
import { AwaleMove } from './AwaleMove';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ActivatedRoute } from '@angular/router';
import { MancalaSingleSowComponent } from '../common/MancalaSingleSowComponent';
import { AwaleMoveGenerator } from './AwaleMoveGenerator';

@Component({
    selector: 'app-awale-component',
    templateUrl: './../common/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class AwaleComponent extends MancalaSingleSowComponent<AwaleRules, AwaleMove> {

    public constructor(messageDisplayer: MessageDisplayer,
                       activatedRoute: ActivatedRoute,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, activatedRoute, cdr);
        this.setRuleAndNode('Awale');
        this.availableAIs = this.createAIs(new AwaleMoveGenerator());
        this.encoder = AwaleMove.encoder;
    }
    public generateMove(x: number): AwaleMove {
        return AwaleMove.of(x);
    }
}
