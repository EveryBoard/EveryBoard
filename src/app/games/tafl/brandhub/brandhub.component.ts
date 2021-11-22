import { Component } from '@angular/core';
import { Coord } from '../../../jscaip/Coord';
import { BrandhubMove } from 'src/app/games/tafl/brandhub/BrandhubMove';
import { BrandhubState } from './BrandhubState';
import { BrandhubRules } from './BrandhubRules';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { TablutMinimax } from '../TablutMinimax';
import { TablutPieceAndInfluenceMinimax } from '../TablutPieceAndInfluenceMinimax';
import { TablutPieceAndControlMinimax } from '../TablutPieceAndControlMinimax';
import { TablutEscapeThenPieceAndControlMinimax } from '../TablutEscapeThenPieceThenControl';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { BrandhubTutorial } from './BrandhubTutorial';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove, BrandhubState> {

    public static throneCoords: Coord[] = [
        new Coord(0, 0),
        new Coord(0, 6),
        new Coord(3, 3),
        new Coord(6, 0),
        new Coord(6, 6),
    ];
    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer,
              BrandhubComponent.throneCoords,
              false,
              BrandhubMove.from);
        this.rules = BrandhubRules.get();
        this.availableMinimaxes = [
            // new TablutMinimax(this.rules, 'DummyBot'),
            // new TablutPieceAndInfluenceMinimax(this.rules, 'Piece > Influence'),
            // new TablutPieceAndControlMinimax(this.rules, 'Piece > Control'),
            // new TablutEscapeThenPieceAndControlMinimax(this.rules, 'Escape > Piece > Control'),
        ];
        this.encoder = BrandhubMove.encoder;
        this.tutorial = new BrandhubTutorial().tutorial;
        this.updateBoard();
    }
}
