import { Component } from '@angular/core';
import { QuartoMove } from './QuartoMove';
import { QuartoState } from './QuartoState';
import { QuartoRules } from './QuartoRules';
import { QuartoMinimax } from './QuartoMinimax';
import { QuartoPiece } from './QuartoPiece';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { QuartoTutorial } from './QuartoTutorial';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';

@Component({
    selector: 'app-quarto',
    templateUrl: './quarto.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class QuartoComponent extends RectangularGameComponent<QuartoRules,
                                                              QuartoMove,
                                                              QuartoState,
                                                              QuartoPiece>
{
    public EMPTY: QuartoPiece = QuartoPiece.NONE;

    public chosen: Coord = new Coord(-1, -1);
    public lastMove: Coord = new Coord(-1, -1);
    public pieceInHand: QuartoPiece;
    // the piece that the current user must place on the board
    public pieceToGive: QuartoPiece = QuartoPiece.NONE; // the piece that the user wants to give to the opponent
    public victoriousCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new QuartoRules(QuartoState);
        this.availableMinimaxes = [
            new QuartoMinimax(this.rules, 'QuartoMinimax'),
        ];
        this.encoder = QuartoMove.encoder;
        this.tutorial = new QuartoTutorial().tutorial;
        this.pieceInHand = this.rules.node.gameState.pieceInHand;
        this.updateBoard();
    }
    public updateBoard(): void {
        const state: QuartoState = this.rules.node.gameState;
        const move: QuartoMove = this.rules.node.move;
        this.board = state.getCopiedBoard();
        this.pieceInHand = state.pieceInHand;
        this.victoriousCoords = this.rules.getVictoriousCoords(state);

        if (move == null) {
            this.lastMove = new Coord(-1, -1);
        } else {
            this.lastMove = move.coord;
        }
    }
    public async chooseCoord(x: number, y: number): Promise<MGPValidation> {
        // called when the user click on the quarto board
        const clickValidity: MGPValidation = this.canUserPlay('#chooseCoord_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (this.board[y][x] === QuartoPiece.NONE) {
            // if it's a legal place to put the piece
            this.showPieceInHandOnBoard(x, y); // let's show the user his decision
            if (this.rules.node.gameState.turn === 15) {
                // on last turn user won't be able to click on a piece to give
                // thereby we must put his piece in hand right
                const chosenMove: QuartoMove = new QuartoMove(x, y, QuartoPiece.NONE);
                return this.chooseMove(chosenMove, this.rules.node.gameState, null, null);
            } else if (this.pieceToGive === QuartoPiece.NONE) {
                return MGPValidation.SUCCESS; // the user has just chosen his coord
            } else {
                // the user has already chosen his piece before his coord
                const chosenMove: QuartoMove = new QuartoMove(x, y, this.pieceToGive);
                return this.chooseMove(chosenMove, this.rules.node.gameState, null, null);
            }
        } else {
            // the user chose an occupied place of the board, so an illegal move, so we cancel all
            return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
    }
    public async choosePiece(givenPiece: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#choosePiece_' + givenPiece);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        this.pieceToGive = QuartoPiece.fromInt(givenPiece);
        if (this.chosen.x === -1) {
            return MGPValidation.SUCCESS; // the user has just chosen his piece
        } else {
            // the user has chosen the coord before the piece
            const chosenMove: QuartoMove = new QuartoMove(this.chosen.x, this.chosen.y, this.pieceToGive);
            return this.chooseMove(chosenMove, this.rules.node.gameState, null, null);
        }
    }
    private hideLastMove(): void {
        this.lastMove = new Coord(-1, -1);
    }
    public cancelMoveAttempt(): void {
        this.chosen = new Coord(-1, -1);
        this.pieceToGive = QuartoPiece.NONE;
    }
    private showPieceInHandOnBoard(x: number, y: number): void {
        this.chosen = new Coord(x, y);
    }
    public isRemaining(pawn: number): boolean {
        return QuartoState.isGivable(QuartoPiece.fromInt(pawn), this.board, this.pieceInHand);
    }
    public getCaseClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.lastMove.equals(coord)) {
            return ['moved'];
        }
        return [];
    }
    public getPieceClasses(piece: number): string[] {
        const classes: string[] = [];
        if (piece % 2 === 0) {
            classes.push('player0');
        } else {
            classes.push('player1');
        }
        return classes;
    }
    public getPieceSize(piece: number): number {
        if (piece < 8) {
            return 40;
        } else {
            return 25;
        }
    }
    public pieceHasDot(piece: number): boolean {
        return piece !== QuartoPiece.NONE.value && (piece % 8 < 4);
    }
}
