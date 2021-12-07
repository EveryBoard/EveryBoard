import { Component } from '@angular/core';
import { BrandhubMove } from 'src/app/games/tafl/brandhub/BrandhubMove';
import { BrandhubState } from './BrandhubState';
import { BrandhubRules } from './BrandhubRules';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { TaflMinimax } from '../TaflMinimax';
import { TaflPieceAndInfluenceMinimax } from '../TaflPieceAndInfluenceMinimax';
import { TaflPieceAndControlMinimax } from '../TaflPieceAndControlMinimax';
import { TaflEscapeThenPieceAndControlMinimax } from '../TaflEscapeThenPieceThenControl';
import { BrandhubTutorial } from './BrandhubTutorial';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove, BrandhubState> {

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer,
              false,
              BrandhubMove.from);
        this.rules = BrandhubRules.get();
        this.availableMinimaxes = [
            new TaflMinimax(this.rules, 'DummyBot'),
            new TaflPieceAndInfluenceMinimax(this.rules, 'Piece > Influence'),
            new TaflPieceAndControlMinimax(this.rules, 'Piece > Control'),
            new TaflEscapeThenPieceAndControlMinimax(this.rules, 'Escape > Piece > Control'),
        ];
        this.encoder = BrandhubMove.encoder;
        this.tutorial = new BrandhubTutorial().tutorial;
        this.updateBoard();
    }
}
