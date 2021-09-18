import { Component } from '@angular/core';
import { P4PartSlice } from './P4PartSlice';
import { P4Rules } from './P4Rules';
import { P4Minimax } from './P4Minimax';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { P4Move } from 'src/app/games/p4/P4Move';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { p4Tutorial } from './P4Tutorial';

@Component({
    selector: 'app-p4',
    templateUrl: './p4.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class P4Component extends AbstractGameComponent<P4Move, P4PartSlice> {

    public static VERBOSE: boolean = false;

    public EMPTY_CASE: number = Player.NONE.value;
    public CASE_SIZE: number = 100;
    public STROKE_WIDTH: number = 8;
    public last: Coord;
    public victoryCoords: Coord[] = [];

    public encoder: MoveEncoder<P4Move> = P4Move.encoder;

    public tutorial: TutorialStep[] = p4Tutorial;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new P4Rules(P4PartSlice);
        this.availableMinimaxes = [
            new P4Minimax(this.rules, 'P4Minimax'),
        ];
    }
    public async onClick(x: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const chosenMove: P4Move = P4Move.of(x);
        return await this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public updateBoard(): void {
        const slice: P4PartSlice = this.rules.node.gamePartSlice;
        const lastMove: P4Move = this.rules.node.move;

        this.victoryCoords = P4Rules.getVictoriousCoords(slice);
        this.board = slice.board;
        if (lastMove == null) {
            this.last = null;
        } else {
            const y: number = P4Rules.getLowestUnoccupiedCase(slice.board, lastMove.x) + 1;
            this.last = new Coord(lastMove.x, y);
        }
    }
    public getCaseClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [];
        if (this.victoryCoords.some((c: Coord): boolean => c.equals(coord))) {
            classes.push('victory-stroke');
        } else if (this.last && this.last.equals(coord)) {
            classes.push('last-move');
        }
        return classes;
    }
    public getCaseFillClass(x: number, y: number): string[] {
        const content: number = this.board[y][x];
        return [this.getPlayerClass(Player.of(content))];
    }
}
