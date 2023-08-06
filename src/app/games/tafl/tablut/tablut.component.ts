import { Component } from '@angular/core';
import { TablutMove } from 'src/app/games/tafl/tablut/TablutMove';
import { TablutState } from './TablutState';
import { TablutRules } from './TablutRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TablutTutorial } from './TablutTutorial';
import { TaflComponent } from '../tafl.component';
import { TaflHeuristic, TaflMinimax } from '../TaflMinimax';
import { TaflPieceAndInfluenceHeuristic } from '../TaflPieceAndInfluenceMinimax';
import { TaflPieceAndControlHeuristic } from '../TaflPieceAndControlMinimax';
import { TaflEscapeThenPieceThenControlHeuristic } from '../TaflEscapeThenPieceThenControlMinimax';

@Component({
    selector: 'app-tablut',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class TablutComponent extends TaflComponent<TablutRules, TablutMove, TablutState> {

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer, TablutMove.from);
        this.rules = TablutRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new TaflMinimax('Dummy Minimax', new TaflHeuristic(this.rules)),
            new TaflMinimax('Piece > Influence Minimax', new TaflPieceAndInfluenceHeuristic(this.rules)),
            new TaflMinimax('Piece > Control Minimax', new TaflPieceAndControlHeuristic(this.rules)),
            new TaflMinimax('Escape > Piece > Control Minimax', new TaflEscapeThenPieceThenControlHeuristic(this.rules)),
        ];
        this.encoder = TablutMove.encoder;
        this.tutorial = new TablutTutorial().tutorial;
        this.updateBoard();
    }
}
