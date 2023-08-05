import { Component, OnInit } from '@angular/core';
import { HnefataflMove } from 'src/app/games/tafl/hnefatafl/HnefataflMove';
import { HnefataflState } from './HnefataflState';
import { HnefataflRules } from './HnefataflRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { TaflMinimax } from '../TaflMinimax';
import { TaflPieceAndInfluenceMinimax } from '../TaflPieceAndInfluenceMinimax';
import { TaflPieceAndControlMinimax } from '../TaflPieceAndControlMinimax';
import { TaflEscapeThenPieceThenControlMinimax } from '../TaflEscapeThenPieceThenControlMinimax';
import { HnefataflTutorial } from './HnefataflTutorial';

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
        this.availableMinimaxes = [
            new TaflMinimax(this.rules, 'DummyBot'),
            new TaflPieceAndInfluenceMinimax(this.rules, 'Piece > Influence'),
            new TaflPieceAndControlMinimax(this.rules, 'Piece > Control'),
            new TaflEscapeThenPieceThenControlMinimax(this.rules, 'Escape > Piece > Control'),
        ];
        this.encoder = HnefataflMove.encoder;
        this.tutorial = new HnefataflTutorial().tutorial;
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
}
