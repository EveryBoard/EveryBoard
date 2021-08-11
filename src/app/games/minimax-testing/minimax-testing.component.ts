import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { MinimaxTestingRules } from 'src/app/games/minimax-testing/MinimaxTestingRules';
import { MinimaxTestingPartSlice } from 'src/app/games/minimax-testing/MinimaxTestingPartSlice';
import { MinimaxTestingMove } from 'src/app/games/minimax-testing/MinimaxTestingMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MinimaxTestingMinimax } from './MinimaxTestingMinimax';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';

@Component({
    selector: 'app-minimax-testing',
    templateUrl: './minimax-testing.component.html',
    styleUrls: [],
})
export class MinimaxTestingComponent extends AbstractGameComponent<MinimaxTestingMove, MinimaxTestingPartSlice> {
    public coord: Coord = new Coord(-1, -1);

    public encoder: MoveEncoder<MinimaxTestingMove> = MinimaxTestingMove.encoder;

    public tutorial: TutorialStep[];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        this.availableMinimaxes = [
            new MinimaxTestingMinimax(this.rules, 'MinimaxTestingMinimax'),
        ];
    }
    public async chooseRight(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_right');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const chosenMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
        return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public async chooseDown(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_down');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const chosenMove: MinimaxTestingMove = MinimaxTestingMove.DOWN;
        return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public updateBoard(): void {
        const slice: MinimaxTestingPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.coord = slice.location;
    }
}
