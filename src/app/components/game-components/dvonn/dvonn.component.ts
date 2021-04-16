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
import { HexaLayout } from 'src/app/jscaip/hexa/HexaLayout';
import { PointyHexaOrientation } from 'src/app/jscaip/hexa/HexaOrientation';
import { HexagonalGameComponent }
    from 'src/app/components/game-components/abstract-game-component/HexagonalGameComponent';

@Component({
    selector: 'app-dvonn',
    templateUrl: './dvonn.component.html',
    styleUrls: ['../abstract-game-component/abstract-game-component.css'],
})

export class DvonnComponent extends HexagonalGameComponent<DvonnMove, DvonnPartSlice, LegalityStatus> {
    private static CASE_SIZE: number = 30;
    public rules: DvonnRules = new DvonnRules(DvonnPartSlice);
    public scores: number[] = [0, 0];
    public lastMove: DvonnMove = null;
    public chosen: Coord = null;
    public canPass: boolean = false;
    public disconnecteds: { x: number, y: number, caseContent: DvonnPieceStack }[] = [];
    public hexaBoard: DvonnBoard;

    public hexaLayout: HexaLayout =
        new HexaLayout(DvonnComponent.CASE_SIZE * 1.50,
                       new Coord(-DvonnComponent.CASE_SIZE, DvonnComponent.CASE_SIZE * 2),
                       PointyHexaOrientation.INSTANCE);

    constructor(public snackBar: MatSnackBar) {
        super(snackBar);
        this.showScore = true;
        this.scores = this.rules.getScores(this.rules.node.gamePartSlice);
        this.hexaBoard = this.rules.node.gamePartSlice.hexaBoard;
    }
    public updateBoard(): void {
        const slice: DvonnPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.hexaBoard = slice.hexaBoard;
        this.lastMove = this.rules.node.move;
        this.disconnecteds = [];
        if (this.lastMove) {
            this.calculateDisconnecteds();
        }
        this.canPass = this.rules.canOnlyPass(slice);
        this.scores = this.rules.getScores(slice);
    }
    private calculateDisconnecteds(): void {
        const previousSlice: DvonnPartSlice = this.rules.node.mother.gamePartSlice;
        const slice: DvonnPartSlice = this.rules.node.gamePartSlice;
        for (let y: number = 0; y < slice.hexaBoard.height; y++) {
            for (let x: number = 0; x < slice.hexaBoard.width; x++) {
                const coord: Coord = new Coord(x, y);
                if (slice.hexaBoard.isOnBoard(coord) === true &&
                    coord.equals(this.lastMove.coord) === false) {
                    const stack: DvonnPieceStack = slice.hexaBoard.getAt(coord);
                    const previousStack: DvonnPieceStack = previousSlice.hexaBoard.getAt(coord);
                    if (stack.isEmpty() && !previousStack.isEmpty()) {
                        const disconnected: { x: number, y: number, caseContent: DvonnPieceStack } =
                            { x, y, caseContent: previousStack };
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
            return MGPValidation.failure('User cannot pass');
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
        return this.rules.node.gamePartSlice.hexaBoard.isOnBoard(new Coord(x, y));
    }
    public getPieceClasses(stack: DvonnPieceStack): string[] {
        if (stack.containsSource() && stack.getSize() === 1) {
            return ['other-piece'];
        }
        const playerColor: string = this.getPlayerClass(stack.getOwner());
        if (stack.containsSource()) {
            return [playerColor, 'other-piece-stroke'];
        }
        return [playerColor];
    }
    public getPieceSize(): number {
        return DvonnComponent.CASE_SIZE;
    }
}
