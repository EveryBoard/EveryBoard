import { Component } from '@angular/core';
import { P4State } from './P4State';
import { P4Rules } from './P4Rules';
import { P4Minimax } from './P4Minimax';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { P4Move } from 'src/app/games/p4/P4Move';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { P4Tutorial } from './P4Tutorial';

@Component({
    selector: 'app-p4',
    templateUrl: './p4.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class P4Component extends RectangularGameComponent<P4Rules, P4Move, P4State, Player> {

    public static VERBOSE: boolean = false;

    public EMPTY_CASE: Player = Player.NONE;
    public last: Coord;
    public victoryCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new P4Rules(P4State);
        this.availableMinimaxes = [
            new P4Minimax(this.rules, 'P4Minimax'),
        ];
        this.encoder = P4Move.encoder;
        this.tutorial = new P4Tutorial().tutorial;
        this.updateBoard();
    }
    public async onClick(x: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const chosenMove: P4Move = P4Move.of(x);
        return await this.chooseMove(chosenMove, this.rules.node.gameState, null, null);
    }
    public updateBoard(): void {
        const state: P4State = this.rules.node.gameState;
        const lastMove: P4Move = this.rules.node.move;

        this.victoryCoords = P4Rules.getVictoriousCoords(state);
        this.board = state.board;
        if (lastMove == null) {
            this.last = null;
        } else {
            const y: number = P4Rules.getLowestUnoccupiedCase(state.board, lastMove.x) + 1;
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
        const content: Player = this.board[y][x];
        return [this.getPlayerClass(content)];
    }
}
