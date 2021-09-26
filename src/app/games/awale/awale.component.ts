import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { AwaleRules } from './AwaleRules';
import { AwaleMinimax } from './AwaleMinimax';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwalePartSlice } from './AwalePartSlice';
import { AwaleLegalityStatus } from 'src/app/games/awale/AwaleLegalityStatus';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { AwaleFailure } from './AwaleFailure';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { awaleTutorial } from './AwaleTutorial';

@Component({
    selector: 'app-awale-component',
    templateUrl: './awale.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class AwaleComponent extends AbstractGameComponent<AwaleMove, AwalePartSlice, AwaleLegalityStatus> {

    public encoder: MoveEncoder<AwaleMove> = AwaleMove.encoder;

    public tutorial: TutorialStep[] = awaleTutorial;

    public scores: number[] = [0, 0];

    public last: Coord = new Coord(-1, -1);

    private captured: Coord[] = [];

    private moved: Coord[] = [];

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new AwaleRules(AwalePartSlice);
        this.availableMinimaxes = [
            new AwaleMinimax(this.rules, 'AwaleMinimax'),
        ];
        this.showScore = true;
        this.updateBoard();
    }
    public updateBoard(): void {
        const slice: AwalePartSlice = this.rules.node.gamePartSlice;
        this.scores = slice.getCapturedCopy();
        this.hidePreviousMove();
        const lastMove: AwaleMove = this.rules.node.move;

        this.board = slice.getCopiedBoard();
        if (lastMove != null) {
            const lastPlayer: number = slice.getCurrentEnnemy().value;
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
        const previousSlice: AwalePartSlice = this.rules.node.mother.gamePartSlice;
        for (let y: number = 0; y <= 1; y++) {
            for (let x: number = 0; x <= 5; x++) {
                const coord: Coord = new Coord(x, y);
                const currentValue: number = this.board[y][x];
                const oldValue: number = previousSlice.getBoardAt(coord);
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
        if (y !== this.rules.node.gamePartSlice.getCurrentPlayer().value) {
            return this.cancelMove(AwaleFailure.CANNOT_DISTRIBUTE_FROM_ENEMY_HOME());
        }
        this.last = new Coord(-1, -1); // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove: AwaleMove = AwaleMove.from(x);
        // let's confirm on java-server-side that the move is legal
        return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, this.scores[0], this.scores[1]);
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
