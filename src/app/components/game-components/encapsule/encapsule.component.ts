import {Component} from '@angular/core';
import {Move} from '../../../jscaip/Move';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {EncapsuleRules} from 'src/app/games/encapsule/encapsulerules/EncapsuleRules';
import {EncapsulePartSlice, EncapsuleCase} from 'src/app/games/encapsule/EncapsulePartSlice';
import {EncapsuleMove} from 'src/app/games/encapsule/encapsulemove/EncapsuleMove';
import {EncapsulePiece, EncapsuleMapper} from 'src/app/games/encapsule/EncapsuleEnums';
import {Coord} from 'src/app/jscaip/coord/Coord';
import { EncapsuleLegalityStatus } from 'src/app/games/encapsule/EncapsuleLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';

@Component({
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html'
})
export class EncapsuleComponent extends AbstractGameComponent<EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus> {

    public rules = new EncapsuleRules();

    public mappedBoard: String[][][];

    public caseBoard: EncapsuleCase[][];

    public lastLandingCoord: Coord;

    public lastStartingCoord: MGPOptional<Coord> = MGPOptional.empty();

    public chosenCoord: Coord;

    public chosenPiece: EncapsulePiece;

    public remainingPieces: String[][] = [];

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
        const pieceNames: String[] = slice.getRemainingPiecesCopy().map(piece => EncapsuleMapper.getNameFromPiece(piece));
        this.remainingPieces[0] = pieceNames.filter(piece => EncapsuleMapper.toPlayerFromName(piece) === Player.ZERO);
        this.remainingPieces[1] = pieceNames.filter(piece => EncapsuleMapper.toPlayerFromName(piece) === Player.ONE);

        if (move != null) {
            this.lastLandingCoord = move.landingCoord;
            this.lastStartingCoord = move.startingCoord;
        } else {
            this.lastLandingCoord = null;
            this.lastStartingCoord = MGPOptional.empty();
        }
    }
    public mapNumberBoard(board: number[][]): EncapsuleCase[][] { // TODO: Move those to ArrayUtils and EncapsuleMapper
        return board.map(numberLine =>
                numberLine.map(numberCase =>
                        EncapsuleCase.decode(numberCase)));
    }
    public mapCaseBoard(board: EncapsuleCase[][]): String[][][] { // TODO: Move those to ArrayUtils and EncapsuleMapper
        return board.map(caseLine =>
                caseLine.map(currentCase =>
                        currentCase.toOrderedPieceNames()));
    }
    /********************************** For Online Game **********************************/

    public decodeMove(encodedMove: number): Move {
        return EncapsuleMove.decode(encodedMove);
    }
    public encodeMove(move: EncapsuleMove): number {
        return EncapsuleMove.encode(move);
    }
    // creating method for Encapsule

    public isHighlightedCoord(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        const lastStartingCoord: Coord = this.lastStartingCoord.getOrNull();
        return coord.equals(this.lastLandingCoord) ||
               coord.equals(lastStartingCoord) ||
               coord.equals(this.chosenCoord);
    }
    public isSelectedPiece(pieceName: string): boolean {
        if (this.chosenPiece === null) {
            return false;
        }
        const chosenPieceName: String = EncapsuleMapper.getNameFromPiece(this.chosenPiece);
        return chosenPieceName === pieceName;
    }
    public async onBoardClick(x: number, y: number): Promise<MGPValidation> {
        this.hideLastMove();
        const clickedCoord: Coord = new Coord(x, y);
        if (this.chosenCoord == null) {
            this.chosenCoord = clickedCoord;
            if (this.chosenPiece != null) {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromDrop(this.chosenPiece, clickedCoord);
                return this.suggestMove(chosenMove);
            } else {
                return MGPValidation.failure("no chosen piece");
            }
        } else {
            if (this.chosenCoord.equals(clickedCoord)) {
                this.cancelMove();
                return MGPValidation.failure("chosen coord is different from clicked coord");
            } else {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromMove(this.chosenCoord, clickedCoord);
                return this.suggestMove(chosenMove);
            }
        }
    }
    private hideLastMove() {
        this.lastLandingCoord = null;
        this.lastStartingCoord = MGPOptional.empty();
    }
    private cancelMove() {
        this.chosenCoord = null;
        this.chosenPiece = null;
    }
    public async onPieceClick(pieceString: String): Promise<MGPValidation> {
        this.hideLastMove();
        const piece: EncapsulePiece = this.getEncapsulePieceFromName(pieceString);
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        if (!slice.isDropable(piece) || (piece === this.chosenPiece)) {
            this.cancelMove();
            return MGPValidation.failure("piece is not droppable");
        } else if (this.chosenCoord == null) {
            this.chosenPiece = piece;
            return MGPValidation.failure("no chosen coord");
        } else {
            const chosenMove: EncapsuleMove = EncapsuleMove.fromDrop(piece, this.chosenCoord);
            return this.suggestMove(chosenMove);
        }
    }
    public getEncapsulePieceFromName(pieceName: String): EncapsulePiece {
        return EncapsuleMapper.getPieceFromName(pieceName);
    }
    public isDropable(piece: number) {
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        return slice.isDropable(EncapsulePiece.of(piece));
    }
    // creating method for OnlineQuarto

    private suggestMove(chosenMove: EncapsuleMove): Promise<MGPValidation> {
        this.cancelMove();
        return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
}
