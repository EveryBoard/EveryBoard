import { ChangeDetectorRef, Component } from '@angular/core';
import { AwaleRules } from './AwaleRules';
import { AwaleMove } from './AwaleMove';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { AwaleTutorial } from './AwaleTutorial';
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
                       actRoute: ActivatedRoute,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, actRoute, cdr);
        this.rules = AwaleRules.get();
        this.node = this.rules.getInitialNode(AwaleRules.DEFAULT_CONFIG);
        this.availableAIs = this.createAIs(new AwaleMoveGenerator());
        this.encoder = AwaleMove.encoder;
        this.tutorial = new AwaleTutorial().tutorial;
    }
    public generateMove(x: number): AwaleMove {
        return AwaleMove.of(x);
    }
}
