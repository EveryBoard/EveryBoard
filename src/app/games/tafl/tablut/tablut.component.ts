import { Component } from '@angular/core';
import { Coord } from '../../../jscaip/Coord';
import { TablutMove } from 'src/app/games/tafl/tablut/TablutMove';
import { TablutState } from './TablutState';
import { TablutRules } from './TablutRules';
import { TablutMinimax } from '../TablutMinimax';
import { TablutPieceAndInfluenceMinimax } from '../TablutPieceAndInfluenceMinimax';
import { TablutPieceAndControlMinimax } from '../TablutPieceAndControlMinimax';
import { TablutEscapeThenPieceAndControlMinimax } from '../TablutEscapeThenPieceThenControl';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { TablutTutorial } from './TablutTutorial';
import { TaflComponent } from '../tafl.component';

@Component({
    selector: 'app-tablut',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class TablutComponent extends TaflComponent<TablutRules, TablutMove, TablutState> {

    public static throneCoords: Coord[] = [
        new Coord(0, 0),
        new Coord(0, 8),
        new Coord(4, 4),
        new Coord(8, 0),
        new Coord(8, 8),
    ];
    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer,
              TablutComponent.throneCoords,
              false,
              TablutMove.from);
        this.rules = TablutRules.get();
        this.availableMinimaxes = [
            new TablutMinimax(this.rules, 'DummyBot'),
            new TablutPieceAndInfluenceMinimax(this.rules, 'Piece > Influence'),
            new TablutPieceAndControlMinimax(this.rules, 'Piece > Control'),
            new TablutEscapeThenPieceAndControlMinimax(this.rules, 'Escape > Piece > Control'), // TODOTODO place the 4 not the 3 in the tests
        ];
        this.encoder = TablutMove.encoder;
        this.tutorial = new TablutTutorial().tutorial;
        this.updateBoard();
    }
}
