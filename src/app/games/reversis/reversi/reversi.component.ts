import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { MGPOptional } from '@everyboard/lib';

import { MCTS } from '../../../jscaip/AI/MCTS';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { ReversiMinimax } from '../common/ReversiMinimax';
import { ReversiMove } from '../common/ReversiMove';
import { ReversiMoveGenerator } from '../common/ReversiMoveGenerator';
import { AbstractReversiComponent } from '../common/abstract-reversi.component';

import { ReversiRules } from './ReversiRules';

@Component({
    selector: 'app-reversi',
    templateUrl: '../common/abstract-reversi.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class ReversiComponent extends AbstractReversiComponent<ReversiRules> {

    public constructor() {
        super();
        this.setRulesAndNode('Reversi');
        this.availableAIs = [
            new ReversiMinimax(),
            new MCTS($localize`MCTS`, new ReversiMoveGenerator(), this.rules),
        ];
        this.encoder = ReversiMove.encoder;
        this.scores = MGPOptional.of(PlayerNumberMap.of(2, 2));
    }

}
