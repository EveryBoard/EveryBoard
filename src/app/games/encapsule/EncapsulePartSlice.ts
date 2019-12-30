import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { EncapsulePiece } from "./EncapsulePiece";

export class EncapsulePartSlice extends GamePartSlice {

    readonly turn: number;

    private readonly remainingPieces: EncapsulePiece[];

    constructor(board: number[][], turn: number, remainingPieces: EncapsulePiece[]) {
        super(board, turn);
        this.remainingPieces = remainingPieces;
    }

    public getRemainingPiecesCopy(): EncapsulePiece[] {
        return GamePartSlice.copyArray(this.remainingPieces);
    }

    static getStartingSlice(): EncapsulePartSlice {
        const emptyCase: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
        const emptyNumber: number = emptyCase.encode();
        let startingBoard: number[][] = GamePartSlice.createBiArray(3, 3, emptyNumber);
        /*const startingBoard: number[][] = [
            [0*9+0*3+0*1, 0*9+0*3+1*1, 0*9+1*3+0*1],
            [0*9+1*3+1*1, 1*9+0*3+0*1, 1*9+0*3+1*1],
            [1*9+1*3+0*1, 1*9+1*3+1*1, 2*9+2*3+2*1]
        ];*/
        let initialPieces: EncapsulePiece[] = [
               EncapsulePiece.BIG_BLACK,    EncapsulePiece.BIG_BLACK,    EncapsulePiece.BIG_WHITE,    EncapsulePiece.BIG_WHITE,
            EncapsulePiece.MEDIUM_BLACK, EncapsulePiece.MEDIUM_BLACK, EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.MEDIUM_WHITE,
             EncapsulePiece.SMALL_BLACK,  EncapsulePiece.SMALL_BLACK,  EncapsulePiece.SMALL_WHITE,  EncapsulePiece.SMALL_WHITE];
        return new EncapsulePartSlice(startingBoard, 0, initialPieces);
    }

    static pieceBelongToCurrentPlayer(piece: EncapsulePiece, turn: number): boolean {
        const pieceOwner: Player = EncapsuleCase.toPlayer(piece);
        if (pieceOwner === Player.BLACK) return turn%2 === 0;
        if (pieceOwner === Player.WHITE) return turn%2 === 1;
        throw new Error("NONE belong to neither BLACK nor WHITE");
    }

    public pieceBelongToCurrentPlayer(piece: EncapsulePiece): boolean {
        return EncapsulePartSlice.pieceBelongToCurrentPlayer(piece, this.turn);
    }

    public isGivable(piece: EncapsulePiece): boolean {
        if (!this.pieceBelongToCurrentPlayer(piece)) {
            return false;
        }
        return this.remainingPieces.some(piece => piece === piece);
    }

    public toCase(): EncapsuleCase[][] {
        return this.board.map(line => line.map(n => EncapsuleCase.decode(n))); // TODO: check no one do that twice
    }

    static toNumberBoard(board: EncapsuleCase[][]): number[][] {
        return board.map(line => line.map(c => c.encode()));
    }

    public getPlayerRemainingPieces(player: Player): EncapsulePiece[] {
        return this.remainingPieces.filter(piece => this.pieceBelongToCurrentPlayer(piece));
    }
}

export enum Player {
    BLACK = 0,
    WHITE = 1,
    NONE = 2,
}

export class EncapsuleCase {

    static readonly EMPTY: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);

    public readonly small: Player;

    public readonly medium: Player;

    public readonly big: Player;

    constructor(small: Player, medium: Player, big: Player) {
        if (small == null) throw new Error("Small cannot be null");
        if (medium == null) throw new Error("Medium cannot be null");
        if (big == null) throw new Error("Big cannot be null");
        this.small = small;
        this.medium = medium;
        this.big = big;
    }

    static toPlayer(piece: EncapsulePiece): Player {
        if (piece === EncapsulePiece.BIG_BLACK ||
            piece === EncapsulePiece.MEDIUM_BLACK ||
            piece === EncapsulePiece.SMALL_BLACK) {
            return Player.BLACK;
        } else if (piece === EncapsulePiece.BIG_WHITE ||
                   piece === EncapsulePiece.MEDIUM_WHITE ||
                   piece === EncapsulePiece.SMALL_WHITE) {
            return Player.WHITE;
        } else if (piece === EncapsulePiece.NONE) {
            return Player.NONE;
        } else {
            throw new Error("Unknown piece: " + piece);
        }
    }

    public toOrderedPieceNames(): String[] {
        const smallPiece: EncapsulePiece = EncapsuleCase.toPiece(Size.SMALL, this.small);
        const mediumPiece: EncapsulePiece = EncapsuleCase.toPiece(Size.MEDIUM, this.medium);
        const bigPiece: EncapsulePiece = EncapsuleCase.toPiece(Size.BIG, this.big);
        return [EncapsuleCase.getNameFromPiece(smallPiece),
                EncapsuleCase.getNameFromPiece(mediumPiece),
                EncapsuleCase.getNameFromPiece(bigPiece)];
    }

    static getNameFromPiece(piece: EncapsulePiece): String {
        switch (piece) {
            case EncapsulePiece.BIG_BLACK: return "BIG_BLACK";
            case EncapsulePiece.BIG_WHITE: return "BIG_WHITE";
            case EncapsulePiece.MEDIUM_BLACK: return "MEDIUM_BLACK";
            case EncapsulePiece.MEDIUM_WHITE: return "MEDIUM_WHITE";
            case EncapsulePiece.SMALL_BLACK: return "SMALL_BLACK";
            case EncapsulePiece.SMALL_WHITE: return "SMALL_WHITE";
            case EncapsulePiece.NONE: return "NONE";
            default: throw new Error("Unknown EncapsulePiece: " + piece);
        }
    }

    static getPieceFromName(pieceName: String): EncapsulePiece {
        switch (pieceName) {
            case "BIG_BLACK": return EncapsulePiece.BIG_BLACK;
            case "BIG_WHITE": return EncapsulePiece.BIG_WHITE;
            case "MEDIUM_BLACK": return EncapsulePiece.MEDIUM_BLACK;
            case "MEDIUM_WHITE": return EncapsulePiece.MEDIUM_WHITE;
            case "SMALL_BLACK": return EncapsulePiece.SMALL_BLACK;
            case "SMALL_WHITE": return EncapsulePiece.SMALL_WHITE;
            case "NONE": return EncapsulePiece.NONE;
            default: throw new Error("Unknown EncapsulePiece: " + pieceName);
        }
    }

    static toSize(piece: EncapsulePiece): Size {
        if (piece === EncapsulePiece.BIG_BLACK    || piece === EncapsulePiece.BIG_WHITE) return Size.BIG;
        if (piece === EncapsulePiece.MEDIUM_BLACK || piece === EncapsulePiece.MEDIUM_WHITE) return Size.MEDIUM;
        if (piece === EncapsulePiece.SMALL_BLACK  || piece === EncapsulePiece.SMALL_WHITE) return Size.SMALL;
        if (piece === EncapsulePiece.NONE) return Size.NONE;
        throw new Error("Unknown piece: " + piece);
    }

    static toPiece(size: Size, player: Player): EncapsulePiece {
        if (player === Player.BLACK && size === Size.BIG) return EncapsulePiece.BIG_BLACK;
        if (player === Player.BLACK && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_BLACK;
        if (player === Player.BLACK && size === Size.SMALL) return EncapsulePiece.SMALL_BLACK;
        if (player === Player.WHITE && size === Size.BIG) return EncapsulePiece.BIG_WHITE;
        if (player === Player.WHITE && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_WHITE;
        if (player === Player.WHITE && size === Size.SMALL) return EncapsulePiece.SMALL_WHITE;
        if (player === Player.NONE) return EncapsulePiece.NONE;
        throw new Error("Unknown combinaison (" + size + ", " + player + ")");
    }

    public getBiggest(): EncapsulePiece {
        if (this.big === Player.BLACK) return EncapsulePiece.BIG_BLACK;
        if (this.big === Player.WHITE) return EncapsulePiece.BIG_WHITE;
        if (this.medium === Player.BLACK) return EncapsulePiece.MEDIUM_BLACK;
        if (this.medium === Player.WHITE) return EncapsulePiece.MEDIUM_WHITE;
        if (this.small === Player.BLACK) return EncapsulePiece.SMALL_BLACK;
        if (this.small === Player.WHITE) return EncapsulePiece.SMALL_WHITE;
        return EncapsulePiece.NONE;
    }

    public tryToSuperposePiece(piece: EncapsulePiece): {success: boolean; result: EncapsuleCase} {
        const FAILURE: {success: boolean; result: EncapsuleCase} = {success: false, result: null};
        let biggestPresent: Size = EncapsuleCase.toSize(this.getBiggest());
        if (piece === EncapsulePiece.NONE) {
            throw new Error("Cannot move NONE on a case");
        }
        let pieceSize: Size = EncapsuleCase.toSize(piece);
        if (pieceSize > biggestPresent) {
            return {success: true, result: this.put(piece)};
        } else {
            return {success: false, result: null};
        }
    }

    public removeBiggest(): {removedCase: EncapsuleCase, removedPiece: EncapsulePiece} {
        let removedPiece: EncapsulePiece = this.getBiggest();
        if (removedPiece === EncapsulePiece.NONE) {
            throw new Error("Cannot removed piece from empty case");
        }
        let removedSize: Size = EncapsuleCase.toSize(removedPiece);
        let removedCase: EncapsuleCase;
        if (removedSize === Size.BIG) {
            removedCase = new EncapsuleCase(this.small, this.medium, Player.NONE);
        }
        else if (removedSize === Size.MEDIUM) {
            removedCase = new EncapsuleCase(this.small, Player.NONE, Player.NONE);
        }
        else if (removedSize === Size.SMALL) {
            removedCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
        }
        return {removedCase, removedPiece};
    }

    public put(piece: EncapsulePiece): EncapsuleCase {
        let pieceSize: Size = EncapsuleCase.toSize(piece);
        let piecePlayer: Player = EncapsuleCase.toPlayer(piece);
        if (pieceSize === Size.BIG) {
            return new EncapsuleCase(this.small, this.medium, piecePlayer);
        }
        if (pieceSize === Size.MEDIUM) {
            return new EncapsuleCase(this.small, piecePlayer, this.big);
        }
        if (pieceSize === Size.SMALL) {
            return new EncapsuleCase(piecePlayer, this.medium, this.big);
        }
    }

    public encode(): number {
        return this.small +
               this.medium*3 +
               this.big*9;
    }

    static decode(encapsuleCase: number): EncapsuleCase {
        const small: Player = encapsuleCase%3;
        encapsuleCase -= small;
        encapsuleCase/=3;
        const medium: Player = encapsuleCase%3;
        encapsuleCase -= medium;
        encapsuleCase/=3;
        const big: Player = encapsuleCase;
        return new EncapsuleCase(small, medium, big);
    }

    public belongToCurrentPlayer(currentPlayer: Player): boolean {
        const biggest: EncapsulePiece = this.getBiggest();
        const owner: Player = EncapsuleCase.toPlayer(biggest);
        return owner === currentPlayer;
    }
}

export enum Size {
    NONE = 0,
    SMALL = 1,
    MEDIUM = 2,
    BIG = 3
}