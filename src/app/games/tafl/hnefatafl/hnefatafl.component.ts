import { Component, OnInit } from '@angular/core';
import { HnefataflMove } from 'src/app/games/tafl/hnefatafl/HnefataflMove';
import { HnefataflState } from './HnefataflState';
import { HnefataflRules } from './HnefataflRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { HnefataflTutorial } from './HnefataflTutorial';
import { MCTS } from 'src/app/jscaip/MCTS';
import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflHeuristic } from '../TaflHeuristic';
import { TaflPieceAndInfluenceHeuristic } from '../TaflPieceAndInfluenceHeuristic';
import { TaflPieceAndControlHeuristic } from '../TaflPieceAndControlHeuristic';
import { TaflEscapeThenPieceThenControlHeuristic } from '../TaflEscapeThenPieceThenControlHeuristic';

@Component({
    selector: 'app-hnefatafl',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class HnefataflComponent extends TaflComponent<HnefataflRules, HnefataflMove, HnefataflState> implements OnInit {

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer, HnefataflMove.from);
        this.rules = HnefataflRules.get();
        this.node = this.rules.getInitialNode();
        const moveGenerator: TaflMoveGenerator<HnefataflMove, HnefataflState> = new TaflMoveGenerator(this.rules);
        this.availableAIs = [
            new Minimax('DummyBot', this.rules, new TaflHeuristic(this.rules), moveGenerator),
            new Minimax('Piece > Influence', this.rules, new TaflPieceAndInfluenceHeuristic(this.rules), moveGenerator),
            new Minimax('Piece > Control', this.rules, new TaflPieceAndControlHeuristic(this.rules), moveGenerator),
            new Minimax('Escape > Piece > Control',
                        this.rules,
                        new TaflEscapeThenPieceThenControlHeuristic(this.rules),
                        moveGenerator),
            new MCTS('MCTS', new TaflMoveGenerator(this.rules), this.rules),
        ];
        this.encoder = HnefataflMove.encoder;
        this.tutorial = new HnefataflTutorial().tutorial;
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
}
