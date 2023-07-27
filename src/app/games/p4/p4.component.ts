import { Component } from '@angular/core';
import { P4State } from './P4State';
import { P4Rules } from './P4Rules';
import { P4Minimax } from './P4Minimax';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { P4Move } from 'src/app/games/p4/P4Move';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { P4Tutorial } from './P4Tutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Component({
    selector: 'app-p4',
    templateUrl: './p4.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class P4Component extends RectangularGameComponent<P4Rules, P4Move, P4State, PlayerOrNone> {

    public static VERBOSE: boolean = false;

    public EMPTY: PlayerOrNone = PlayerOrNone.NONE;
    public last: MGPOptional<Coord>;
    public victoryCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = P4Rules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new P4Minimax(this.rules, 'P4Minimax'),
        ];
        this.encoder = P4Move.encoder;
        this.tutorial = new P4Tutorial().tutorial;
        void this.updateBoard();
    }
    public async onClick(x: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const chosenMove: P4Move = P4Move.of(x);
        return await this.chooseMove(chosenMove, this.getState());
    }
    public async updateBoard(): Promise<void> {
        const state: P4State = this.getState();

        this.victoryCoords = P4Rules.getVictoriousCoords(state);
        this.board = state.board;
    }
    public override async showLastMove(move: P4Move): Promise<void> {
        const state: P4State = this.getState();
        const y: number = P4Rules.getLowestUnoccupiedSpace(state.board, move.x) + 1;
        this.last = MGPOptional.of(new Coord(move.x, y));
    }
    public override hideLastMove(): void {
        this.last = MGPOptional.empty();
    }
    public getSquareFillClass(x: number, y: number): string[] {
        const content: PlayerOrNone = this.board[y][x];
        return [this.getPlayerClass(content)];
    }
}
