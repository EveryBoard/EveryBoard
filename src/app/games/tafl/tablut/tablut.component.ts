import { Component } from '@angular/core';
import { TablutMove } from 'src/app/games/tafl/tablut/TablutMove';
import { TablutState } from './TablutState';
import { TablutRules } from './TablutRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TablutTutorial } from './TablutTutorial';
import { TaflComponent } from '../tafl.component';
import { MCTS } from 'src/app/jscaip/MCTS';
import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflHeuristic } from '../TaflHeuristic';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflPieceAndInfluenceHeuristic } from '../TaflPieceAndInfluenceHeuristic';
import { TaflPieceAndControlHeuristic } from '../TaflPieceAndControlHeuristic';
import { TaflEscapeThenPieceThenControlHeuristic } from '../TaflEscapeThenPieceThenControlHeuristic';

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
        const moveGenerator: TaflMoveGenerator<TablutMove, TablutState> = new TaflMoveGenerator(this.rules);
        this.availableAIs = [
            new Minimax('Minimax', this.rules, new TaflHeuristic(this.rules), moveGenerator),
            new Minimax('Piece > Influence', this.rules, new TaflPieceAndInfluenceHeuristic(this.rules), moveGenerator),
            new Minimax('Piece > Control', this.rules, new TaflPieceAndControlHeuristic(this.rules), moveGenerator),
            new Minimax('Escape > Piece > Control',
                        this.rules,
                        new TaflEscapeThenPieceThenControlHeuristic(this.rules),
                        moveGenerator),
            new MCTS('MCTS', moveGenerator, this.rules),
        ];
        this.encoder = TablutMove.encoder;
        this.tutorial = new TablutTutorial().tutorial;
        this.updateBoard();
    }
}
