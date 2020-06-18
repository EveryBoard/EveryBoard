import {Component} from '@angular/core';
import {Move} from '../../../jscaip/Move';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {EncapsuleRules} from 'src/app/games/encapsule/encapsulerules/EncapsuleRules';
import {EncapsulePartSlice, EncapsuleCase} from 'src/app/games/encapsule/EncapsulePartSlice';
import {EncapsuleMove} from 'src/app/games/encapsule/encapsulemove/EncapsuleMove';
import {EncapsulePiece, EncapsuleMapper} from 'src/app/games/encapsule/EncapsuleEnums';
import {Coord} from 'src/app/jscaip/Coord';
import { EncapsuleLegalityStatus } from 'src/app/games/encapsule/EncapsuleLegalityStatus';

@Component({
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html'
})
export class EncapsuleComponent extends AbstractGameComponent<EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus> {

    public rules = new EncapsuleRules();

    public mappedBoard: String[][][];

    public caseBoard: EncapsuleCase[][];

    public lastLandingCoord: Coord;

    public lastStartingCoord: Coord;

    public chosenCoord: Coord;

    public chosenPiece: EncapsulePiece;

    public remainingPieces: String[];

    public ngOnInit() {
        this.updateBoard();
    }
    public isVictory(): boolean {
        return EncapsuleRules.isVictory(this.rules.node.gamePartSlice);
    }
    public updateBoard() {
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        const move: EncapsuleMove = this.rules.node.move;
        this.cancelMove();
        this.caseBoard = this.mapNumberBoard(slice.getCopiedBoard());
        this.mappedBoard = this.mapCaseBoard(this.caseBoard);
        this.remainingPieces = slice.getRemainingPiecesCopy().map(piece => EncapsuleMapper.getNameFromPiece(piece));

        if (move != null) {
            this.lastLandingCoord = move.landingCoord;
            this.lastStartingCoord = move.startingCoord;
        }
    }
    public mapNumberBoard(board: number[][]): EncapsuleCase[][] {
        return board.map(numberLine =>
                numberLine.map(numberCase =>
                        EncapsuleCase.decode(numberCase)));
    }
    public mapCaseBoard(board: EncapsuleCase[][]): String[][][] {
        return board.map(caseLine =>
                caseLine.map(currentCase =>
                        currentCase.toOrderedPieceNames()));
    }
    /********************************** For Online Game **********************************/

    public decodeMove(encodedMove: number): Move {
        return EncapsuleMove.decode(encodedMove);
    }
    public encodeMove(move: EncapsuleMove): number {
        return move.encode();
    }
    // creating method for Encapsule

    public isHighlightedCoord(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        return coord.equals(this.lastLandingCoord) ||
               coord.equals(this.lastStartingCoord) ||
               coord.equals(this.chosenCoord);
    }
    public onBoardClick(x: number, y: number) {
        this.hideLastMove();
        const clickedCoord: Coord = new Coord(x, y);
        if (this.chosenCoord == null) {
            this.chosenCoord = clickedCoord;
            if (this.chosenPiece != null) {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromDrop(this.chosenPiece, clickedCoord);
                this.suggestMove(chosenMove);
            }
        } else {
            if (this.chosenCoord.equals(clickedCoord)) {
                this.cancelMove();
            } else {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromMove(this.chosenCoord, clickedCoord);
                return this.suggestMove(chosenMove);
            }
        }
    }
    private hideLastMove() {
        this.lastLandingCoord = null;
        this.lastStartingCoord = null;
    }
    private cancelMove() {
        this.chosenCoord = null;
        this.chosenPiece = null;
    }
    public onPieceClick(pieceString: String) {
        this.hideLastMove();
        const piece: EncapsulePiece = this.getEncapsulePieceFromName(pieceString);
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        if (!slice.isDropable(piece) || (piece === this.chosenPiece)) {
            this.cancelMove();
        } else if (this.chosenCoord == null) {
            this.chosenPiece = piece;
        } else {
            const chosenMove: EncapsuleMove = EncapsuleMove.fromDrop(piece, this.chosenCoord);
            this.suggestMove(chosenMove);
        }
    }
    public getEncapsulePieceFromName(pieceName: String): EncapsulePiece {
        return EncapsuleMapper.getPieceFromName(pieceName);
    }
    public isDropable(piece: number) {
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        return slice.isDropable(piece);
    }
    // creating method for OnlineQuarto

    private suggestMove(chosenMove: EncapsuleMove) {
        this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
}