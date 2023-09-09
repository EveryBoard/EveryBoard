import { Component } from '@angular/core';
import { TablutMove } from 'src/app/games/tafl/tablut/TablutMove';
import { TablutState } from './TablutState';
import { TablutRules } from './TablutRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TablutTutorial } from './TablutTutorial';
import { TaflComponent } from '../tafl.component';
import { TaflMinimax } from '../TaflMinimax';
import { TaflPieceAndInfluenceMinimax } from '../TaflPieceAndInfluenceMinimax';
import { TaflPieceAndControlMinimax } from '../TaflPieceAndControlMinimax';
import { TaflEscapeThenPieceThenControlMinimax } from '../TaflEscapeThenPieceThenControlMinimax';
import { ActivatedRoute } from '@angular/router';
import { tablutConfig } from './tablutConfig';

@Component({
    selector: 'app-tablut',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class TablutComponent extends TaflComponent<TablutRules, TablutMove, TablutState> {

    public constructor(messageDisplayer: MessageDisplayer, actRoute: ActivatedRoute) {
        super(messageDisplayer, actRoute, TablutMove.from);
        this.rules = TablutRules.get();
        this.node = this.rules.getInitialNode(tablutConfig);
        this.availableMinimaxes = [
            new TaflMinimax(this.rules, 'DummyBot'),
            new TaflPieceAndInfluenceMinimax(this.rules, 'Piece > Influence'),
            new TaflPieceAndControlMinimax(this.rules, 'Piece > Control'),
            new TaflEscapeThenPieceThenControlMinimax(this.rules, 'Escape > Piece > Control'),
        ];
        this.encoder = TablutMove.encoder;
        this.tutorial = new TablutTutorial().tutorial;
        this.updateBoard();
    }
}
