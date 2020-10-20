import { Player } from "src/app/jscaip/Player";
import { Comparable } from "src/app/collectionlib/Comparable";

export class EncapsulePiece implements Comparable {

    public static readonly SMALL_BLACK: EncapsulePiece = new EncapsulePiece(0);

    public static readonly SMALL_WHITE: EncapsulePiece = new EncapsulePiece(1);

    public static readonly MEDIUM_BLACK: EncapsulePiece = new EncapsulePiece(2);

    public static readonly MEDIUM_WHITE: EncapsulePiece = new EncapsulePiece(3);

    public static readonly BIG_BLACK: EncapsulePiece = new EncapsulePiece(4);

    public static readonly BIG_WHITE: EncapsulePiece = new EncapsulePiece(5);

    public static readonly NONE: EncapsulePiece = new EncapsulePiece(6);

    public static of(value: number): EncapsulePiece {
        switch (value) {
            case 0: return this.SMALL_BLACK;
            case 1: return this.SMALL_WHITE;
            case 2: return this.MEDIUM_BLACK;
            case 3: return this.MEDIUM_WHITE;
            case 4: return this.BIG_BLACK;
            case 5: return this.BIG_WHITE;
            case 6: return this.NONE;
            default: throw new Error("Invalid value " + value + " for EncapsulePiece")
        }
    }
    private constructor(public readonly value: number) {
    }
    public equals(piece: EncapsulePiece): boolean {
        return piece.value === this.value;
    }
    public getValue(): number {
        return this.value;
    }
}
export enum Size {
    NONE = 0,
    SMALL = 1,
    MEDIUM = 2,
    BIG = 3,
}
export class EncapsuleMapper {

    public static toPieceNameFromSizeAndPlayer(size: Size, player: Player): String {
        const piece: EncapsulePiece = EncapsuleMapper.toPiece(size, player);
        return EncapsuleMapper.getNameFromPiece(piece);
    }
    public static toPiece(size: Size, player: Player): EncapsulePiece {
        if (player === Player.ZERO && size === Size.BIG)    return EncapsulePiece.BIG_BLACK;
        if (player === Player.ZERO && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_BLACK;
        if (player === Player.ZERO && size === Size.SMALL)  return EncapsulePiece.SMALL_BLACK;
        if (player === Player.ONE  && size === Size.BIG)    return EncapsulePiece.BIG_WHITE;
        if (player === Player.ONE  && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_WHITE;
        if (player === Player.ONE  && size === Size.SMALL)  return EncapsulePiece.SMALL_WHITE;
        if (player === Player.NONE && size === Size.NONE)   return EncapsulePiece.NONE;
        throw new Error("Unknown combinaison (" + size + ", " + player + ")");
    }
    public static getNameFromPiece(piece: EncapsulePiece): String {
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
    public static toPlayer(piece: EncapsulePiece): Player {
        if (piece === EncapsulePiece.BIG_BLACK    ||
            piece === EncapsulePiece.MEDIUM_BLACK ||
            piece === EncapsulePiece.SMALL_BLACK) {
            return Player.ZERO;
        } else if (piece === EncapsulePiece.BIG_WHITE    ||
                   piece === EncapsulePiece.MEDIUM_WHITE ||
                   piece === EncapsulePiece.SMALL_WHITE) {
            return Player.ONE;
        } else if (piece === EncapsulePiece.NONE) {
            return Player.NONE;
        } else {
            throw new Error("Unknown piece: " + piece);
        }
    }
    public static toPlayerFromName(pieceName: String): Player {
        const piece: EncapsulePiece = EncapsuleMapper.getPieceFromName(pieceName);
        return EncapsuleMapper.toPlayer(piece);
    }
    public static getPieceFromName(pieceName: String): EncapsulePiece {
        switch (pieceName) {
            case "BIG_BLACK":    return EncapsulePiece.BIG_BLACK;
            case "BIG_WHITE":    return EncapsulePiece.BIG_WHITE;
            case "MEDIUM_BLACK": return EncapsulePiece.MEDIUM_BLACK;
            case "MEDIUM_WHITE": return EncapsulePiece.MEDIUM_WHITE;
            case "SMALL_BLACK":  return EncapsulePiece.SMALL_BLACK;
            case "SMALL_WHITE":  return EncapsulePiece.SMALL_WHITE;
            case "NONE": return EncapsulePiece.NONE;
            default: throw new Error("Unknown EncapsulePiece: " + pieceName);
        }
    }
    public static toSize(piece: EncapsulePiece): Size {
        if (piece === EncapsulePiece.BIG_BLACK    || piece === EncapsulePiece.BIG_WHITE)    return Size.BIG;
        if (piece === EncapsulePiece.MEDIUM_BLACK || piece === EncapsulePiece.MEDIUM_WHITE) return Size.MEDIUM;
        if (piece === EncapsulePiece.SMALL_BLACK  || piece === EncapsulePiece.SMALL_WHITE)  return Size.SMALL;
        if (piece === EncapsulePiece.NONE) return Size.NONE;
        throw new Error("Unknown piece: " + piece);
    }
    public static toValidPiece(size: Size, player: Player): EncapsulePiece {
        if (size === Size.NONE || player === Player.NONE) return EncapsulePiece.NONE;
        return EncapsuleMapper.toPiece(size, player);
    }
    public static fromPiecesToNumbers(pieces: EncapsulePiece[]): number[] {
        return pieces.map(piece => piece.value);
    }
    public static fromPieceBiArrayToBoard(pieceBoard: EncapsulePiece[][]): number[][] {
        return pieceBoard.map(array => EncapsuleMapper.fromPiecesToNumbers(array));
    }
}
