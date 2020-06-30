import { Player } from "src/app/jscaip/Player";

export enum EncapsulePiece { // TODO: make static class
    SMALL_BLACK = 0,
    SMALL_WHITE = 1,
    MEDIUM_BLACK = 2,
    MEDIUM_WHITE = 3,
    BIG_BLACK = 4,
    BIG_WHITE = 5,
    NONE = 6
}
export enum Size {
    NONE = 0,
    SMALL = 1,
    MEDIUM = 2,
    BIG = 3,
}
export class EncapsuleMapper {

    static toPieceNameFromSizeAndPlayer(size: Size, player: Player): String {
        const piece: EncapsulePiece = EncapsuleMapper.toPiece(size, player);
        return EncapsuleMapper.getNameFromPiece(piece);
    }
    static toPiece(size: Size, player: Player): EncapsulePiece {
        if (player === Player.ZERO && size === Size.BIG)    return EncapsulePiece.BIG_BLACK;
        if (player === Player.ZERO && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_BLACK;
        if (player === Player.ZERO && size === Size.SMALL)  return EncapsulePiece.SMALL_BLACK;
        if (player === Player.ONE  && size === Size.BIG)    return EncapsulePiece.BIG_WHITE;
        if (player === Player.ONE  && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_WHITE;
        if (player === Player.ONE  && size === Size.SMALL)  return EncapsulePiece.SMALL_WHITE;
        if (player === Player.NONE && size === Size.NONE)   return EncapsulePiece.NONE;
        throw new Error("Unknown combinaison (" + size + ", " + player + ")");
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
    static toPlayer(piece: EncapsulePiece): Player {
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
    static toPlayerFromName(pieceName: String): Player {
        const piece: EncapsulePiece = EncapsuleMapper.getPieceFromName(pieceName);
        return EncapsuleMapper.toPlayer(piece);
    }
    static getPieceFromName(pieceName: String): EncapsulePiece {
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
    static toSize(piece: EncapsulePiece): Size {
        if (piece === EncapsulePiece.BIG_BLACK    || piece === EncapsulePiece.BIG_WHITE)    return Size.BIG;
        if (piece === EncapsulePiece.MEDIUM_BLACK || piece === EncapsulePiece.MEDIUM_WHITE) return Size.MEDIUM;
        if (piece === EncapsulePiece.SMALL_BLACK  || piece === EncapsulePiece.SMALL_WHITE)  return Size.SMALL;
        if (piece === EncapsulePiece.NONE) return Size.NONE;
        throw new Error("Unknown piece: " + piece);
    }
    static toValidPiece(size: Size, player: Player): EncapsulePiece {
        if (size === Size.NONE || player === Player.NONE) return EncapsulePiece.NONE;
        return EncapsuleMapper.toPiece(size, player);
    }
}