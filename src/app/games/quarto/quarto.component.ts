import { Component } from '@angular/core';
import { QuartoMove } from './QuartoMove';
import { QuartoState } from './QuartoState';
import { QuartoRules } from './QuartoRules';
import { QuartoMinimax } from './QuartoMinimax';
import { QuartoPiece } from './QuartoPiece';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { QuartoTutorial } from './QuartoTutorial';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { MGPOptional } from 'src/app/utils/MGPOptional';

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
    public EMPTY: QuartoPiece = QuartoPiece.EMPTY;
    public QuartoPiece: typeof QuartoPiece = QuartoPiece;

    public chosen: MGPOptional<Coord> = MGPOptional.empty();
    public lastMove: MGPOptional<Coord> = MGPOptional.empty();
    // the piece that the current user must place on the board
    public pieceInHand: QuartoPiece = QuartoPiece.EMPTY;
    // the piece that the user wants to give to the opponent
    public pieceToGive: MGPOptional<QuartoPiece> = MGPOptional.empty();
    public victoriousCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = QuartoRules.get();
        this.node = this.rules.getInitialNode();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new QuartoMinimax(this.rules, 'QuartoMinimax'),
        ];
        this.encoder = QuartoMove.encoder;
        this.tutorial = new QuartoTutorial().tutorial;
        this.pieceInHand = this.getState().pieceInHand;
    }
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: QuartoState = this.getState();
        const move: MGPOptional<QuartoMove> = this.node.move;
        this.board = state.getCopiedBoard();
        this.chosen = MGPOptional.empty();
        this.pieceInHand = state.pieceInHand;
        this.victoriousCoords = this.rules.getVictoriousCoords(state);
        this.lastMove = move.map((move: QuartoMove) => move.coord);
    }
    public async chooseCoord(x: number, y: number): Promise<MGPValidation> {
        // called when the user click on the quarto board
        const clickValidity: MGPValidation = await this.canUserPlay('#chooseCoord_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (this.board[y][x] === QuartoPiece.EMPTY) {
            // if it's a legal place to put the piece
            this.showPieceInHandOnBoard(x, y); // let's show the user his decision
            if (this.getState().turn === 15) {
                // on last turn user won't be able to click on a piece to give
                // thereby we must put his piece in hand right
                const chosenMove: QuartoMove = new QuartoMove(x, y, QuartoPiece.EMPTY);
                return this.chooseMove(chosenMove);
            } else if (this.pieceToGive.isAbsent()) {
                return MGPValidation.SUCCESS; // the user has just chosen his coord
            } else {
                // the user has already chosen his piece before his coord
                const chosenMove: QuartoMove = new QuartoMove(x, y, this.pieceToGive.get());
                return this.chooseMove(chosenMove);
            }
        } else {
            // the user chose an occupied place of the board, so an illegal move, so we cancel all
            return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
    }
    public async choosePiece(givenPiece: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#choosePiece_' + givenPiece);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (this.pieceToGive.equalsValue(QuartoPiece.ofInt(givenPiece))) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        this.pieceToGive = MGPOptional.of(QuartoPiece.ofInt(givenPiece));
        if (this.chosen.isAbsent()) {
            return MGPValidation.SUCCESS; // the user has just chosen his piece
        } else {
            // the user has chosen the coord before the piece
            const chosen: Coord = this.chosen.get();
            const chosenMove: QuartoMove = new QuartoMove(chosen.x, chosen.y, this.pieceToGive.get());
            return this.chooseMove(chosenMove);
        }
    }
    public override hideLastMove(): void {
        this.lastMove = MGPOptional.empty();
    }
    public override cancelMoveAttempt(): void {
        this.hideLastMove();
        this.pieceToGive = MGPOptional.empty();
        this.chosen = MGPOptional.empty();
    }
    public async deselectDroppedPiece(): Promise<MGPValidation> {
        // So it does not throw when there is no dese chosen piece (used in clickValidity test)
        const chosen: Coord = this.chosen.getOrElse(new Coord(404, 404));
        const droppedPieceName: string = '#droppedPiece_' + chosen.x + '_' + chosen.y;
        const clickValidity: MGPValidation = await this.canUserPlay(droppedPieceName);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.cancelMoveAttempt();
        return MGPValidation.SUCCESS;
    }
    private showPieceInHandOnBoard(x: number, y: number): void {
        this.chosen = MGPOptional.of(new Coord(x, y));
    }
    public isRemaining(pawn: number): boolean {
        return QuartoState.isGivable(QuartoPiece.ofInt(pawn), this.board, this.pieceInHand);
    }
    public getSquareClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.lastMove.equalsValue(coord)) {
            return ['moved-fill'];
        }
        return [];
    }
    public getPieceClasses(piece: number): string[] {
        const classes: string[] = [];
        if (piece % 2 === 0) {
            classes.push('player0-fill');
        } else {
            classes.push('player1-fill');
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
        return piece !== QuartoPiece.EMPTY.value && (piece % 8 < 4);
    }
}
