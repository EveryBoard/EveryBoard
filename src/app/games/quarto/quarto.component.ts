import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { MGPOptional, MGPValidation, Set } from '@everyboard/lib';

import { ClickHandler } from '../../components/game-components/game-component/GameComponent';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { MCTS } from '../../jscaip/AI/MCTS';
import { Coord } from '../../jscaip/Coord';
import { RulesFailure } from '../../jscaip/RulesFailure';

import { QuartoMinimax } from './QuartoMinimax';
import { QuartoMove } from './QuartoMove';
import { QuartoMoveGenerator } from './QuartoMoveGenerator';
import { QuartoPiece } from './QuartoPiece';
import { QuartoConfig, QuartoRules } from './QuartoRules';
import { QuartoState } from './QuartoState';

@Component({
    selector: 'app-quarto',
    templateUrl: './quarto.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class QuartoComponent extends RectangularGameComponent<QuartoRules,
                                                              QuartoMove,
                                                              QuartoState,
                                                              QuartoPiece,
                                                              QuartoConfig>
{
    public EMPTY: QuartoPiece = QuartoPiece.EMPTY;
    public QuartoPiece: typeof QuartoPiece = QuartoPiece;

    public chosen: MGPOptional<Coord> = MGPOptional.empty();
    public lastMove: MGPOptional<Coord> = MGPOptional.empty();
    // the piece that the current user must place on the board
    public pieceInHand: QuartoPiece = QuartoPiece.EMPTY;
    // the piece that the user wants to give to the opponent
    public pieceToGive: MGPOptional<QuartoPiece> = MGPOptional.empty();
    public victoriousCoords: Set<Coord> = new Set();

    public constructor() {
        super();
        this.setRulesAndNode('Quarto');
        this.availableAIs = [
            new QuartoMinimax(),
            new MCTS($localize`MCTS`, new QuartoMoveGenerator(), this.rules),
        ];
        this.encoder = QuartoMove.encoder;
        this.pieceInHand = this.getState().pieceInHand;
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: QuartoState = this.getState();
        this.board = state.getCopiedBoard();
        this.pieceInHand = state.pieceInHand;
        const config: QuartoConfig = this.getConfig();
        this.victoriousCoords = this.rules.getVictoriousCoords(state, config);
    }

    @ClickHandler((coord: Coord) => `#click-coord-${ coord.x }-${ coord.y }`)
    public async clickCoord(coord: Coord): Promise<MGPValidation> {
        // called when the user click on the quarto board
        if (this.chosen.equalsValue(coord)) {
            return this.cancelMove();
        }
        if (this.board[coord.y][coord.x] === QuartoPiece.EMPTY) {
            // if it's a legal place to put the piece
            this.showPieceInHandOnBoard(coord); // let's show the user his decision
            if (this.getState().turn === 15) {
                // on last turn user won't be able to click on a piece to give
                // thereby we must put his piece in hand right
                const chosenMove: QuartoMove = new QuartoMove(coord.x, coord.y, QuartoPiece.EMPTY);
                return this.chooseMove(chosenMove);
            } else if (this.pieceToGive.isAbsent()) {
                return MGPValidation.SUCCESS; // the user has just chosen their coord
            } else {
                // the user has already chosen his piece before his coord
                const chosenMove: QuartoMove = new QuartoMove(coord.x, coord.y, this.pieceToGive.get());
                return this.chooseMove(chosenMove);
            }
        } else {
            // the user chose an occupied place of the board, so an illegal move, so we cancel all
            return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
    }

    @ClickHandler((givenPiece: number) => '#click-piece-' + givenPiece)
    public async clickPiece(givenPiece: number): Promise<MGPValidation> {
        if (this.pieceToGive.equalsValue(QuartoPiece.ofInt(givenPiece))) {
            return this.cancelMove();
        }
        this.pieceToGive = MGPOptional.of(QuartoPiece.ofInt(givenPiece));
        if (this.chosen.isAbsent()) {
            return MGPValidation.SUCCESS; // the user has just chosen their piece
        } else {
            // the user has chosen the coord before the piece
            const chosen: Coord = this.chosen.get();
            const chosenMove: QuartoMove = new QuartoMove(chosen.x, chosen.y, this.pieceToGive.get());
            return this.chooseMove(chosenMove);
        }
    }

    public override async showLastMove(move: QuartoMove): Promise<void> {
        this.lastMove = MGPOptional.of(move.coord);
    }

    public override hideLastMove(): void {
        this.lastMove = MGPOptional.empty();
    }

    public override cancelMoveAttempt(): void {
        this.pieceToGive = MGPOptional.empty();
        this.chosen = MGPOptional.empty();
    }

    private showPieceInHandOnBoard(coord: Coord): void {
        this.chosen = MGPOptional.of(coord);
    }

    public isRemaining(piece: number): boolean {
        return QuartoState.isGivable(QuartoPiece.ofInt(piece), this.board, this.pieceInHand);
    }

    public getSquareClasses(coord: Coord): string[] {
        if (this.lastMove.equalsValue(coord)) {
            return ['moved-fill'];
        } else {
            return [];
        }
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
            return 35;
        } else {
            return 20;
        }
    }

    public pieceHasDot(piece: number): boolean {
        return piece !== QuartoPiece.EMPTY.value && (piece % 8 < 4);
    }

}
