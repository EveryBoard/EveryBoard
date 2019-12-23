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
        const emptyNumber: number = EncapsuleCase.encode(emptyCase);
        let startingBoard: number[][] = GamePartSlice.createBiArray(3, 3, emptyNumber);
        let initialPieces: EncapsulePiece[] = [
               EncapsulePiece.BIG_BLACK,    EncapsulePiece.BIG_BLACK,    EncapsulePiece.BIG_WHITE,    EncapsulePiece.BIG_WHITE,
            EncapsulePiece.MEDIUM_BLACK, EncapsulePiece.MEDIUM_BLACK, EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.MEDIUM_WHITE,
             EncapsulePiece.SMALL_BLACK,  EncapsulePiece.SMALL_BLACK,  EncapsulePiece.SMALL_WHITE,  EncapsulePiece.SMALL_WHITE];
        return new EncapsulePartSlice(startingBoard, 0, initialPieces);
    }
}

export class EncapsuleCase {

    public readonly small: Player;

    public readonly medium: Player;

    public readonly big: Player;

    constructor(small: Player, medium: Player, big: Player) {
        this.small = small;
        this.medium = medium;
        this.big = big;
    }

    getBiggest(): EncapsulePiece {
        if (this.big !== Player.NONE) {
            return this.big === Player.BLACK ? EncapsulePiece.BIG_BLACK : EncapsulePiece.BIG_WHITE;
        } else if (this.medium !== Player.NONE) {
            return this.medium === Player.BLACK ? EncapsulePiece.MEDIUM_BLACK : EncapsulePiece.MEDIUM_WHITE;
        } else if (this.small !== Player.NONE) {
            return this.small === Player.BLACK ? EncapsulePiece.SMALL_BLACK : EncapsulePiece.SMALL_WHITE;
        } else {
            return EncapsulePiece.NONE;
        }
    }

    static encode(encapsuleCase: EncapsuleCase): number {
        return encapsuleCase.small +
               encapsuleCase.medium*3 +
               encapsuleCase.big*9;
    }

    static decode(encapsuleCase: number): EncapsuleCase {
        const small: Player = encapsuleCase%3;
        encapsuleCase -= small;
        const medium: Player = encapsuleCase%3;
        encapsuleCase -= medium;
        const big: Player = encapsuleCase;
        return new EncapsuleCase(small, medium, big);
    }
}

export enum Player {
    BLACK = 0,
    WHITE = 1,
    NONE = 2,
}