import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { MGPOptional } from '@everyboard/lib';

import { MCTS } from '../../../jscaip/AI/MCTS';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { ReversiMinimax } from '../common/ReversiMinimax';
import { ReversiMove } from '../common/ReversiMove';
import { ReversiMoveGenerator } from '../common/ReversiMoveGenerator';
import { AbstractReversiComponent } from '../common/abstract-reversi.component';

import { ToricReversiRules } from './ToricReversiRules';

@Component({
    selector: 'app-toric-reversi',
    templateUrl: '../common/abstract-reversi.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class ToricReversiComponent extends AbstractReversiComponent<ToricReversiRules> {

    public constructor() {
        super();
        this.setRulesAndNode('ToricReversi');
        this.availableAIs = [
            new ReversiMinimax(),
            new MCTS($localize`MCTS`, new ReversiMoveGenerator(), this.rules),
        ];
        this.encoder = ReversiMove.encoder;
        this.scores = MGPOptional.of(PlayerNumberMap.of(2, 2));
    }

}
