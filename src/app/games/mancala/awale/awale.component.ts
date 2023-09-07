import { ChangeDetectorRef, Component } from '@angular/core';
import { AwaleRules } from './AwaleRules';
import { AwaleMinimax } from './AwaleMinimax';
import { AwaleMove } from './AwaleMove';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { AwaleTutorial } from './AwaleTutorial';
import { MancalaSingleSowComponent } from '../commons/MancalaSingleSowComponent';

@Component({
    selector: 'app-awale-component',
    templateUrl: './../commons/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class AwaleComponent extends MancalaSingleSowComponent<AwaleRules, AwaleMove> {

    public constructor(messageDisplayer: MessageDisplayer,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, cdr);
        this.rules = AwaleRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new AwaleMinimax(),
        ];
        this.encoder = AwaleMove.encoder;
        this.tutorial = new AwaleTutorial().tutorial;
    }
    public generateMove(x: number): AwaleMove {
        return AwaleMove.of(x);
    }
}
