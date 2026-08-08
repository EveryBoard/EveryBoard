import { Component, ModelSignal, model } from '@angular/core';

import { MGPOptional } from '@everyboard/lib';

import { MCTS } from '../../../jscaip/AI/MCTS';
import { ScoreName } from '../../../components/game-components/game-component/GameComponent';
import { GobanGameComponent } from '../../../components/game-components/goban-game-component/GobanGameComponent';
import { BlankGobanComponent } from '../../../components/game-components/goban-game-component/blank-goban/blank-goban.component';
import { GroupData } from '../../../jscaip/BoardData';
import { Coord } from '../../../jscaip/Coord';
import { AbstractRectangularGoComponent } from '../abstract-rectangular-go/abstract-rectangular-go.component';
import { GoBoardComponent } from '../abstract-rectangular-go/go-board/go-board.component';

import { GoHeuristic } from './GoHeuristic';
import { GoMoveGenerator } from './GoMoveGenerator';

@Component({
    selector: 'app-go',
    templateUrl: '../abstract-rectangular-go/abstract-rectangular-go.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [GoBoardComponent],
})
export class GoComponent extends AbstractRectangularGoComponent {

    public hover: ModelSignal<MGPOptional<Coord>> = model(MGPOptional.empty());

    public constructor() {
        super();
        this.setRulesAndNode('Go');
    }

}
