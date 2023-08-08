import { Component, OnInit } from '@angular/core';
import { HnefataflMove } from 'src/app/games/tafl/hnefatafl/HnefataflMove';
import { HnefataflState } from './HnefataflState';
import { HnefataflRules } from './HnefataflRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { TaflHeuristic, TaflMinimax, TaflMoveGenerator } from '../TaflMinimax';
import { TaflPieceAndInfluenceHeuristic } from '../TaflPieceAndInfluenceMinimax';
import { TaflPieceAndControlHeuristic } from '../TaflPieceAndControlMinimax';
import { TaflEscapeThenPieceThenControlHeuristic } from '../TaflEscapeThenPieceThenControlMinimax';
import { HnefataflTutorial } from './HnefataflTutorial';
import { MCTS } from 'src/app/jscaip/MCTS';

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
        this.availableAIs = [
            new TaflMinimax('DummyBot', new TaflHeuristic(this.rules)),
            new TaflMinimax('Piece > Influence', new TaflPieceAndInfluenceHeuristic(this.rules)),
            new TaflMinimax('Piece > Control', new TaflPieceAndControlHeuristic(this.rules)),
            new TaflMinimax('Escape > Piece > Control', new TaflEscapeThenPieceThenControlHeuristic(this.rules)),
            new MCTS('MCTS', new TaflMoveGenerator(this.rules), this.rules),
        ];
        this.encoder = HnefataflMove.encoder;
        this.tutorial = new HnefataflTutorial().tutorial;
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
}
