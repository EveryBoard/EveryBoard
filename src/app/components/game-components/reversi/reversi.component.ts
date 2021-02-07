import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { ReversiRules } from '../../../games/reversi/reversi-rules/ReversiRules';
import { ReversiPartSlice } from '../../../games/reversi/ReversiPartSlice';
import { ReversiMove } from 'src/app/games/reversi/reversi-move/ReversiMove';
import { ReversiLegalityStatus } from 'src/app/games/reversi/ReversiLegalityStatus';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { Player } from 'src/app/jscaip/player/Player';
import { Direction } from 'src/app/jscaip/DIRECTION';

@Component({
    selector: 'app-reversi',
    templateUrl: './reversi.component.html',
})
export class ReversiComponent extends AbstractGameComponent<ReversiMove, ReversiPartSlice, ReversiLegalityStatus> {
    public NONE: number = Player.NONE.value;
    public lastMove: Coord = new Coord(-2, -2);

    public scores: number[] = [2, 2];

    private captureds: Coord[] = [];

    constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.showScore = true;
        this.canPass = false;
        this.rules = new ReversiRules(ReversiPartSlice);
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        this.lastMove = new Coord(-1, -1); // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove: ReversiMove = new ReversiMove(x, y);

        return await this.chooseMove(chosenMove, this.rules.node.gamePartSlice, this.scores[0], this.scores [1]);
    }
    public cancelMove(reason?: string): void {
        // Empty because not needed.
    }
    public decodeMove(encodedMove: number): ReversiMove {
        return ReversiMove.decode(encodedMove);
    }
    public encodeMove(move: ReversiMove): number {
        return move.encode();
    }
    public updateBoard(): void {
        const slice: ReversiPartSlice = this.rules.node.gamePartSlice;

        this.board = slice.getCopiedBoard();

        if (this.rules.node.move) {
            this.showPreviousMove();
        } else {
            this.lastMove = new Coord(-2, -2);
        }

        this.scores = slice.countScore();
        this.canPass = ReversiRules.playerCanOnlyPass(slice);
    }
    private showPreviousMove() {
        this.lastMove = this.rules.node.move.coord;
        this.captureds = [];
        const PLAYER: number = this.rules.node.gamePartSlice.getCurrentPlayer().value;
        const ENNEMY: number = this.rules.node.gamePartSlice.getCurrentEnnemy().value;
        for (const dir of Direction.DIRECTIONS) {
            let captured: Coord = this.lastMove.getNext(dir, 1);
            while (captured.isInRange(ReversiPartSlice.BOARD_WIDTH, ReversiPartSlice.BOARD_HEIGHT) &&
                this.rules.node.gamePartSlice.getBoardAt(captured) === ENNEMY &&
                this.rules.node.mother.gamePartSlice.getBoardAt(captured) === PLAYER)
            {
                this.captureds.push(captured);
                captured = captured.getNext(dir, 1);
            }
        }
    }
    public getRectFill(x: number, y: number): string {
        const coord: Coord = new Coord(x, y);
        if (this.captureds.some((c: Coord) => c.equals(coord))) {
            return this.CAPTURED_FILL;
        } else if (coord.equals(this.lastMove)) {
            return this.MOVED_FILL;
        } else {
            return this.NORMAL_FILL;
        }
    }
    public getPieceStyle(x: number, y: number): any {
        const fill: string = this.getPlayerColor(this.board[y][x]);
        return { fill };
    }
    public async pass(): Promise<MGPValidation> {
        return this.onClick(ReversiMove.PASS.coord.x, ReversiMove.PASS.coord.y);
    }
}
