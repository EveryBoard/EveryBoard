import { Component, OnInit } from '@angular/core';
import { BrandhubMove } from 'src/app/games/tafl/brandhub/BrandhubMove';
import { BrandhubState } from './BrandhubState';
import { BrandhubRules } from './BrandhubRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { TaflMinimax } from '../TaflMinimax';
import { TaflPieceAndInfluenceMinimax } from '../TaflPieceAndInfluenceMinimax';
import { TaflPieceAndControlMinimax } from '../TaflPieceAndControlMinimax';
import { TaflEscapeThenPieceThenControlMinimax } from '../TaflEscapeThenPieceThenControlMinimax';
import { BrandhubTutorial } from './BrandhubTutorial';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove, BrandhubState> implements OnInit {

    public constructor(messageDisplayer: MessageDisplayer, actRoute: ActivatedRoute) {
        super(messageDisplayer, false, actRoute, BrandhubMove.from);
        this.rules = BrandhubRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new TaflMinimax(this.rules, 'DummyBot'),
            new TaflPieceAndInfluenceMinimax(this.rules, 'Piece > Influence'),
            new TaflPieceAndControlMinimax(this.rules, 'Piece > Control'),
            new TaflEscapeThenPieceThenControlMinimax(this.rules, 'Escape > Piece > Control'),
        ];
        this.encoder = BrandhubMove.encoder;
        this.tutorial = new BrandhubTutorial().tutorial;
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
}
