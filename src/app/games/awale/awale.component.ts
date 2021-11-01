import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { AwaleRules } from './AwaleRules';
import { AwaleMinimax } from './AwaleMinimax';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwaleState } from './AwaleState';
import { AwaleLegalityStatus } from 'src/app/games/awale/AwaleLegalityStatus';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { AwaleFailure } from './AwaleFailure';
import { AwaleTutorial } from './AwaleTutorial';

@Component({
    selector: 'app-awale-component',
    templateUrl: './awale.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class AwaleComponent extends RectangularGameComponent<AwaleRules,
                                                             AwaleMove,
                                                             AwaleState,
                                                             number,
                                                             AwaleLegalityStatus>
{
    public scores: number[] = [0, 0];

    public last: Coord = new Coord(-1, -1);

    private captured: Coord[] = [];

    private moved: Coord[] = [];

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new AwaleRules(AwaleState);
        this.availableMinimaxes = [
            new AwaleMinimax(this.rules, 'AwaleMinimax'),
        ];
        this.encoder = AwaleMove.encoder;
        this.tutorial = new AwaleTutorial().tutorial;
        this.showScore = true;

        this.updateBoard();
    }
    public updateBoard(): void {
        const state: AwaleState = this.rules.node.gameState;
        this.scores = state.getCapturedCopy();
        this.hidePreviousMove();
        const lastMove: AwaleMove = this.rules.node.move;

        this.board = state.getCopiedBoard();
        if (lastMove != null) {
            const lastPlayer: number = state.getCurrentOpponent().value;
            this.last = new Coord(lastMove.x, lastPlayer);
            this.showPreviousMove();
        } else {
            this.last = null;
        }
    }
    private hidePreviousMove(): void {
        this.captured = [];
        this.moved = [];
    }
    private showPreviousMove(): void {
        const previousState: AwaleState = this.rules.node.mother.gameState;
        for (let y: number = 0; y <= 1; y++) {
            for (let x: number = 0; x <= 5; x++) {
                const coord: Coord = new Coord(x, y);
                const currentValue: number = this.board[y][x];
                const oldValue: number = previousState.getPieceAt(coord);
                if (!coord.equals(this.last)) {
                    if (currentValue < oldValue) {
                        this.captured.push(coord);
                    } else if (currentValue > oldValue) {
                        this.moved.push(coord);
                    }
                }
            }
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (y !== this.rules.node.gameState.getCurrentPlayer().value) {
            return this.cancelMove(AwaleFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
        }
        this.last = new Coord(-1, -1); // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove: AwaleMove = AwaleMove.from(x);
        // let's confirm on java-server-side that the move is legal
        return this.chooseMove(chosenMove, this.rules.node.gameState, this.scores[0], this.scores[1]);
    }
    public getCaseClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.captured.some((c: Coord) => c.equals(coord))) {
            return ['captured'];
        } else if (coord.equals(this.last)) {
            return ['moved', 'highlighted'];
        } else if (this.moved.some((c: Coord) => c.equals(coord))) {
            return ['moved'];
        } else {
            return [];
        }
    }
}
