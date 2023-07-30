import { Component, OnInit } from '@angular/core';
import { BrandhubMove } from 'src/app/games/tafl/brandhub/BrandhubMove';
import { BrandhubState } from './BrandhubState';
import { BrandhubRules } from './BrandhubRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { TaflHeuristic, TaflMinimax } from '../TaflMinimax';
import { TaflPieceAndInfluenceHeuristic } from '../TaflPieceAndInfluenceMinimax';
import { TaflPieceAndControlHeuristic } from '../TaflPieceAndControlMinimax';
import { TaflEscapeThenPieceThenControlHeuristic } from '../TaflEscapeThenPieceThenControlMinimax';
import { BrandhubTutorial } from './BrandhubTutorial';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove, BrandhubState> implements OnInit {

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer, false, BrandhubMove.from);
        this.rules = BrandhubRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new TaflMinimax('DummyMinimax', new TaflHeuristic(this.rules)),
            new TaflMinimax('Piece > Influence Minimax', new TaflPieceAndInfluenceHeuristic(this.rules)),
            new TaflMinimax('Piece > Control Minimax', new TaflPieceAndControlHeuristic(this.rules)),
            new TaflMinimax('Escape > Piece > Control Minimax', new TaflEscapeThenPieceThenControlHeuristic(this.rules)),
        ];
        this.encoder = BrandhubMove.encoder;
        this.tutorial = new BrandhubTutorial().tutorial;
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
}
