import {Component} from '@angular/core';
import {Move} from '../../../jscaip/Move';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {EncapsuleRules} from 'src/app/games/encapsule/EncapsuleRules';
import {EncapsulePartSlice, EncapsuleCase} from 'src/app/games/encapsule/EncapsulePartSlice';
import {EncapsuleMove} from 'src/app/games/encapsule/EncapsuleMove';
import {EncapsulePiece, EncapsuleMapper} from 'src/app/games/encapsule/EncapsuleEnums';
import {Coord} from 'src/app/jscaip/Coord';

@Component({
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html'
})
export class EncapsuleComponent extends AbstractGameComponent {

    rules = new EncapsuleRules();

    mappedBoard: String[][][];

    caseBoard: EncapsuleCase[][];

    imagesLocation = 'assets/images/'; // en prod
    // imagesLocation = 'src/assets/images/'; // en dev

    lastLandingCoord: Coord;

    lastStartingCoord: Coord;

    chosenCoord: Coord;

    chosenPiece: EncapsulePiece;

    remainingPieces: String[];

    ngOnInit() {
        this.updateBoard();
    }

    isVictory(): boolean {
        return EncapsuleRules.isVictory(this.rules.node.gamePartSlice as EncapsulePartSlice); 
    }

    updateBoard() {
        console.log('update online board');
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice as EncapsulePartSlice;
        const move: EncapsuleMove = this.rules.node.getMove() as EncapsuleMove;
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

    decodeMove(encodedMove: number): Move {
        return EncapsuleMove.decode(encodedMove);
    }

    encodeMove(move: EncapsuleMove): number {
        return move.encode();
    }

    // creating method for Encapsule

    isHighlightedCoord(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        return coord.equals(this.lastLandingCoord) ||
               coord.equals(this.lastStartingCoord) ||
               coord.equals(this.chosenCoord);
    }

    onBoardClick(x: number, y: number) {
        this.hideLastMove();
        const clickedCoord: Coord = new Coord(x, y);
        console.log("click on coord "+clickedCoord);
        if (this.chosenCoord == null) {
            console.log("there was no chosen coord");
            this.chosenCoord = clickedCoord;
            if (this.chosenPiece != null) {
                console.log("let's choose Drop!");
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromDrop(this.chosenPiece, clickedCoord);
                this.suggestMove(chosenMove);
            }
        } else {
            if (this.chosenCoord.equals(clickedCoord)) {
                this.cancelMove();
            } else {
                console.log("there was a chosen coord, let's choose move!");
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
        console.log("click on piece :" + piece);
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice as EncapsulePartSlice; 
        if (!slice.isDropable(piece) ||
            (piece === this.chosenPiece)) {
            this.cancelMove();
        } else if (this.chosenCoord == null) {
            this.chosenPiece = piece;
        } else {
            console.log("let's choose aspira-Drop!");
            const chosenMove: EncapsuleMove = EncapsuleMove.fromDrop(piece, this.chosenCoord);
            this.suggestMove(chosenMove);
        }
    }

    getEncapsulePieceFromName(pieceName: String): EncapsulePiece {
        return EncapsuleMapper.getPieceFromName(pieceName);
    }

    isDropable(piece: number) {
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice as EncapsulePartSlice;
        return slice.isDropable(piece);
    }

    // creating method for OnlineQuarto

    suggestMove(chosenMove: EncapsuleMove) {
        console.log("try move");
        if (this.rules.isLegal(chosenMove)) {
            console.log('Et javascript estime que votre mouvement est légal');
            // player make a correct move
            // let's confirm on java-server-side that the move is legal
            this.chooseMove(chosenMove, null, null);
        } else {
            console.log('Mais c\'est un mouvement illegal');
            this.cancelMove();
        }
    }
}