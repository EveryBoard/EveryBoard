import { AbstractGameComponent } from '../../wrapper-components/AbstractGameComponent';
import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DvonnBoard } from 'src/app/games/dvonn/DvonnBoard';
import { DvonnMove } from 'src/app/games/dvonn/dvonn-move/DvonnMove';
import { DvonnPartSlice } from 'src/app/games/dvonn/DvonnPartSlice';
import { DvonnRules } from 'src/app/games/dvonn/dvonn-rules/DvonnRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { DvonnPieceStack } from 'src/app/games/dvonn/dvonn-piece-stack/DvonnPieceStack';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-dvonn',
    templateUrl: './dvonn.component.html',
})

export class DvonnComponent extends AbstractGameComponent<DvonnMove, DvonnPartSlice, LegalityStatus> {
    public rules: DvonnRules = new DvonnRules(DvonnPartSlice);

    public scores: number[] = [0, 0];

    public CASE_SIZE: number = 70;

    public lastMove: DvonnMove = null;

    public chosen: Coord = null;

    public canPass: boolean = false;

    public disconnecteds: { x: number, y: number, caseContent: number }[] = [];

    constructor(public snackBar: MatSnackBar) {
        super(snackBar);
        this.showScore = true;
        this.scores = this.rules.getScores(this.rules.node.gamePartSlice);
    }
    public updateBoard(): void {
        const slice: DvonnPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.lastMove = this.rules.node.move;
        this.disconnecteds = [];
        if (this.lastMove) {
            this.calculateDisconnecteds();
        }
        this.canPass = this.rules.canOnlyPass(slice);
        this.chosen = null;
        this.scores = this.rules.getScores(slice);
    }
    private calculateDisconnecteds(): void {
        const previousSlice: DvonnPartSlice = this.rules.node.mother.gamePartSlice;
        const slice: DvonnPartSlice = this.rules.node.gamePartSlice;
        for (let y: number = 0; y < slice.board.length; y++) {
            for (let x: number = 0; x < slice.board[0].length; x++) {
                const coord: Coord = new Coord(x, y);
                if (coord.equals(this.lastMove.coord) === false) {
                    const stack: DvonnPieceStack = DvonnPieceStack.of(slice.getBoardAt(coord));
                    const caseContent: number = previousSlice.getBoardAt(coord);
                    const previousStack: DvonnPieceStack = DvonnPieceStack.of(caseContent);
                    if (stack.isEmpty() && !previousStack.isEmpty()) {
                        const disconnected: { x: number, y: number, caseContent: number } = { x, y, caseContent };
                        this.disconnecteds.push(disconnected);
                    }
                }
            }
        }
    }
    public cancelMoveAttempt(): void {
        this.chosen = null;
    }
    public async pass(): Promise<MGPValidation> {
        if (this.canPass) {
            return await this.chooseMove(DvonnMove.PASS, this.rules.node.gamePartSlice, null, null);
        } else {
            // TODO: Should'nt it be an Exception ?
            return this.cancelMove('Cannot pass.');
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.chosen === null) {
            return this.choosePiece(x, y);
        } else {
            return await this.chooseDestination(x, y);
        }
    }
    public choosePiece(x: number, y: number): MGPValidation {
        if (this.rules.node.isEndGame()) {
            // TODO: wtf, should not be needed
            return this.cancelMove('Cannot choose a piece at the end of the game');
        }
        const coord: Coord = new Coord(x, y);
        const legal: MGPValidation = this.rules.isMovablePiece(this.rules.node.gamePartSlice, coord);
        if (legal.isSuccess()) {
            this.chosen = coord;
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(legal.getReason());
        }
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        try {
            const move: DvonnMove = DvonnMove.of(chosenPiece, chosenDestination);
            return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
        } catch (e) {
            return this.cancelMove('Cannot choose this move: ' + e);
        }
    }
    public decodeMove(encodedMove: number): DvonnMove {
        return DvonnMove.decode(encodedMove);
    }
    public encodeMove(move: DvonnMove): number {
        return DvonnMove.encode(move);
    }
    public isOnBoard(x: number, y: number): boolean {
        return DvonnBoard.isOnBoard(new Coord(x, y));
    }
    public center(x: number, y: number): Coord {
        const xshift: number = y * this.CASE_SIZE/2;
        return new Coord(xshift + this.CASE_SIZE / 2 + (x * this.CASE_SIZE),
                         this.CASE_SIZE / 2 + (y * (this.CASE_SIZE * 0.75)));
    }
    public isSource(stackValue: number): boolean {
        return DvonnPieceStack.of(stackValue).containsSource();
    }
    public size(stackValue: number): number {
        return DvonnPieceStack.of(stackValue).size();
    }
    public stylePiece(stackValue: number, hasSource: boolean): { [key: string]: string } {
        const stack: DvonnPieceStack = DvonnPieceStack.of(stackValue);
        const playerColor: string = this.getPlayerColor(stack.getOwner());
        return {
            fill: (hasSource && stack.size() === 1) ? 'red' : playerColor,
            stroke: hasSource ? 'red' : playerColor,
        };
    }
    public pieceText(stackValue: number): string {
        return '' + DvonnPieceStack.of(stackValue).size();
    }
    public getHexaCoordinates(center: Coord): string {
        const x: number = center.x;
        const y: number = center.y;
        const size: number = this.CASE_SIZE/2;
        const halfsize: number = size / 2;
        const a: Coord = new Coord(x, y + size);
        const b: Coord = new Coord(x + size, y + halfsize);
        const c: Coord = new Coord(x + size, y - halfsize);
        const d: Coord = new Coord(x, y - size);
        const e: Coord = new Coord(x - size, y - halfsize);
        const f: Coord = new Coord(x - size, y + halfsize);
        return a.x + ' ' + a.y + ' ' +
               b.x + ' ' + b.y + ' ' +
               c.x + ' ' + c.y + ' ' +
               d.x + ' ' + d.y + ' ' +
               e.x + ' ' + e.y + ' ' +
               f.x + ' ' + f.y + ' ' +
               a.x + ' ' + a.y;
    }
}
