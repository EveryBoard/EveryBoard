import { Component } from '@angular/core';
import { Move } from '../../../jscaip/Move';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { EncapsuleRules } from 'src/app/games/encapsule/encapsule-rules/EncapsuleRules';
import { EncapsulePartSlice, EncapsuleCase } from 'src/app/games/encapsule/EncapsulePartSlice';
import { EncapsuleMove } from 'src/app/games/encapsule/encapsule-move/EncapsuleMove';
import { EncapsulePiece, EncapsuleMapper } from 'src/app/games/encapsule/EncapsuleEnums';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { EncapsuleLegalityStatus } from 'src/app/games/encapsule/EncapsuleLegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

@Component({
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html',
})
export class EncapsuleComponent extends AbstractGameComponent<EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus> {
    public rules = new EncapsuleRules(EncapsulePartSlice);

    public mappedBoard: string[][][];

    public caseBoard: EncapsuleCase[][];

    public lastLandingCoord: Coord;

    public lastStartingCoord: MGPOptional<Coord> = MGPOptional.empty();

    public chosenCoord: Coord;

    public chosenPiece: EncapsulePiece;

    public remainingPieces: string[][] = [];

    public isVictory(): boolean {
        return EncapsuleRules.isVictory(this.rules.node.gamePartSlice);
    }
    public updateBoard() {
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        const move: EncapsuleMove = this.rules.node.move;
        this.cancelMove();
        this.caseBoard = this.mapNumberBoard(slice.getCopiedBoard());
        this.mappedBoard = this.mapCaseBoard(this.caseBoard);
        const pieceNames: string[] = slice.getRemainingPiecesCopy().map(EncapsuleMapper.getNameFromPiece);
        this.remainingPieces[0] = pieceNames.filter((piece) => EncapsuleMapper.toPlayerFromName(piece) === Player.ZERO);
        this.remainingPieces[1] = pieceNames.filter((piece) => EncapsuleMapper.toPlayerFromName(piece) === Player.ONE);

        if (move != null) {
            this.lastLandingCoord = move.landingCoord;
            this.lastStartingCoord = move.startingCoord;
        } else {
            this.lastLandingCoord = null;
            this.lastStartingCoord = MGPOptional.empty();
        }
    }
    public mapNumberBoard(board: number[][]): EncapsuleCase[][] { // TODO: Move those to ArrayUtils and EncapsuleMapper
        return ArrayUtils.mapBiArray(board, EncapsuleCase.decode);
    }
    public mapCaseBoard(board: EncapsuleCase[][]): string[][][] { // TODO: Move those to ArrayUtils and EncapsuleMapper
        return ArrayUtils.mapBiArray(board, (c: EncapsuleCase) => c.toOrderedPieceNames());
    }
    /** ******************************** For Online Game **********************************/

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
        const chosenPieceName: string = EncapsuleMapper.getNameFromPiece(this.chosenPiece);
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
                return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
            } else {
                return this.cancelMove('no chosen piece');
            }
        } else {
            if (this.chosenCoord.equals(clickedCoord)) {
                return this.cancelMove('Chosen coord must be different from clicked coord');
            } else {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromMove(this.chosenCoord, clickedCoord);
                return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
            }
        }
    }
    private hideLastMove() {
        this.lastLandingCoord = null;
        this.lastStartingCoord = MGPOptional.empty();
    }
    public cancelMove(reason?: string): MGPValidation {
        this.chosenCoord = null;
        this.chosenPiece = null;
        if (reason) {
            this.message(reason);
            return MGPValidation.failure(reason);
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    public async onPieceClick(pieceString: string): Promise<MGPValidation> {
        this.hideLastMove();
        const piece: EncapsulePiece = this.getEncapsulePieceFromName(pieceString);
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        if (!slice.isDropable(piece) || (piece === this.chosenPiece)) {
            return this.cancelMove('piece is not droppable');
        } else if (this.chosenCoord == null) {
            this.chosenPiece = piece;
            return MGPValidation.SUCCESS;
        } else {
            const chosenMove: EncapsuleMove = EncapsuleMove.fromDrop(piece, this.chosenCoord);
            return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
        }
    }
    public getEncapsulePieceFromName(pieceName: string): EncapsulePiece {
        return EncapsuleMapper.getPieceFromName(pieceName);
    }
    public isDropable(piece: number) {
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        return slice.isDropable(EncapsulePiece.of(piece));
    }
}
