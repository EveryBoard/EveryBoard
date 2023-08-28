import { Component, OnInit } from '@angular/core';
import { BrandhubMove } from 'src/app/games/tafl/brandhub/BrandhubMove';
import { BrandhubState } from './BrandhubState';
import { BrandhubRules } from './BrandhubRules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TaflComponent } from '../tafl.component';
import { BrandhubTutorial } from './BrandhubTutorial';
import { MCTS } from 'src/app/jscaip/MCTS';
import { TaflPieceAndInfluenceHeuristic } from '../TaflPieceAndInfluenceHeuristic';
import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflHeuristic } from '../TaflHeuristic';
import { TaflPieceAndControlHeuristic } from '../TaflPieceAndControlHeuristic';
import { TaflEscapeThenPieceThenControlHeuristic } from '../TaflEscapeThenPieceThenControlHeuristic';

@Component({
    selector: 'app-brandhub',
    templateUrl: '../tafl.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class BrandhubComponent extends TaflComponent<BrandhubRules, BrandhubMove, BrandhubState> implements OnInit {

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer, BrandhubMove.from);
        this.rules = BrandhubRules.get();
        this.node = this.rules.getInitialNode();
        const moveGenerator: TaflMoveGenerator<BrandhubMove, BrandhubState> = new TaflMoveGenerator(this.rules);
        this.availableAIs = [
            new Minimax('Dummy', this.rules, new TaflHeuristic(this.rules), moveGenerator),
            new Minimax('Piece > Influence', this.rules, new TaflPieceAndInfluenceHeuristic(this.rules), moveGenerator),
            new Minimax('Piece > Control', this.rules, new TaflPieceAndControlHeuristic(this.rules), moveGenerator),
            new Minimax('Escape > Piece > Control',
                        this.rules,
                        new TaflEscapeThenPieceThenControlHeuristic(this.rules),
                        moveGenerator),
            new MCTS('MCTS', new TaflMoveGenerator(this.rules), this.rules),
        ];
        this.encoder = BrandhubMove.encoder;
        this.tutorial = new BrandhubTutorial().tutorial;
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
}
