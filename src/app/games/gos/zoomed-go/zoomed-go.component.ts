import { Component, ModelSignal, model } from '@angular/core';

import { MGPOptional } from '@everyboard/lib';

import { MCTS } from '../../../jscaip/AI/MCTS';
import { Coord } from '../../../jscaip/Coord';
import { AbstractRectangularGoComponent } from '../abstract-rectangular-go/abstract-rectangular-go.component';
import { GoBoardComponent } from '../abstract-rectangular-go/go-board/go-board.component';
import { ZoomedGoMinimax } from '../zoomed-go/ZoomedGoMinimax';

import { ZoomedGoMoveGenerator } from './ZoomedGoMoveGenerator';

@Component({
    selector: 'app-zoomed-go',
    templateUrl: '../abstract-rectangular-go/abstract-rectangular-go.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [GoBoardComponent],
})
export class ZoomedGoComponent extends AbstractRectangularGoComponent {

    public hover: ModelSignal<MGPOptional<Coord>> = model(MGPOptional.empty());

    public constructor() {
        super();
        this.setRulesAndNode('ZoomedGo');
        this.availableAIs = [
            new ZoomedGoMinimax(),
            new MCTS($localize`MCTS`, new ZoomedGoMoveGenerator(), this.rules),
        ];
    }

}
