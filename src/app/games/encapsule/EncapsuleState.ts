import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { EncapsulePiece, Size } from 'src/app/games/encapsule/EncapsulePiece';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { ArrayUtils, MGPOptional, Utils } from '@everyboard/lib';

export class EncapsuleState extends GameStateWithTable<EncapsuleSpace> {

    private readonly remainingPieces: ReadonlyArray<EncapsulePiece>;

    public constructor(board: Table<EncapsuleSpace>, turn: number, remainingPieces: EncapsulePiece[]) {
        super(board, turn);
        this.remainingPieces = remainingPieces;
    }

    public getRemainingPieces(): EncapsulePiece[] {
        return ArrayUtils.copy(this.remainingPieces);
    }

    public getRemainingPiecesOfPlayer(player: Player): EncapsulePiece[] {
        return this.getRemainingPieces().filter((piece: EncapsulePiece) => piece.getPlayer() === player);
    }

    public pieceBelongsToCurrentPlayer(piece: EncapsulePiece): boolean {
        return piece.belongsTo(this.getCurrentPlayer());
    }

    public isDroppable(piece: EncapsulePiece): boolean {
        return this.pieceBelongsToCurrentPlayer(piece) && this.isInRemainingPieces(piece);
    }

    public isInRemainingPieces(piece: EncapsulePiece): boolean {
        return this.remainingPieces.some((p: EncapsulePiece) => p === piece);
    }

    public getPlayerRemainingPieces(): EncapsulePiece[] {
        return this.remainingPieces.filter((piece: EncapsulePiece) => this.pieceBelongsToCurrentPlayer(piece));
    }
}

export class EncapsuleSpace {

    public static readonly EMPTY: EncapsuleSpace =
        new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);

    public constructor(public readonly small: PlayerOrNone,
                       public readonly medium: PlayerOrNone,
                       public readonly big: PlayerOrNone)
    {
    }

    public isEmpty(): boolean {
        return this.small.isNone() && this.medium.isNone() && this.big.isNone();
    }

    public toList(): EncapsulePiece[] {
        const l: EncapsulePiece[] = [];
        if (this.small.isPlayer()) l.push(EncapsulePiece.ofSizeAndPlayer(Size.SMALL, this.small));
        if (this.medium.isPlayer()) l.push(EncapsulePiece.ofSizeAndPlayer(Size.MEDIUM, this.medium));
        if (this.big.isPlayer()) l.push(EncapsulePiece.ofSizeAndPlayer(Size.BIG, this.big));
        return l;
    }

    public toOrderedPieceNames(): string[] {
        const smallPiece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.SMALL, this.small);
        const mediumPiece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.MEDIUM, this.medium);
        const bigPiece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.BIG, this.big);
        return [smallPiece.toString(), mediumPiece.toString(), bigPiece.toString()];
    }

    public getBiggest(): EncapsulePiece {
        if (this.big === Player.ZERO) return EncapsulePiece.BIG_DARK;
        if (this.big === Player.ONE) return EncapsulePiece.BIG_LIGHT;
        if (this.medium === Player.ZERO) return EncapsulePiece.MEDIUM_DARK;
        if (this.medium === Player.ONE) return EncapsulePiece.MEDIUM_LIGHT;
        if (this.small === Player.ZERO) return EncapsulePiece.SMALL_DARK;
        if (this.small === Player.ONE) return EncapsulePiece.SMALL_LIGHT;
        return EncapsulePiece.NONE;
    }

    public tryToSuperposePiece(piece: EncapsulePiece): MGPOptional<EncapsuleSpace> {
        const biggestPresent: Size = this.getBiggest().getSize();
        if (piece === EncapsulePiece.NONE) {
            throw new Error('Cannot move EMPTY on a space');
        }
        if (piece.getSize() > biggestPresent) {
            return MGPOptional.of(this.put(piece));
        } else {
            return MGPOptional.empty();
        }
    }

    public removeBiggest(): {removedSpace: EncapsuleSpace, removedPiece: EncapsulePiece} {
        const removedPiece: EncapsulePiece = this.getBiggest();
        if (removedPiece === EncapsulePiece.NONE) {
            throw new Error('Cannot removed piece from empty space');
        }
        let removedSpace: EncapsuleSpace;
        const size: Size = removedPiece.getSize();
        switch (size) {
            case Size.BIG:
                removedSpace = new EncapsuleSpace(this.small, this.medium, PlayerOrNone.NONE);
                break;
            case Size.MEDIUM:
                removedSpace = new EncapsuleSpace(this.small, PlayerOrNone.NONE, PlayerOrNone.NONE);
                break;
            default:
                Utils.expectToBe(size, Size.SMALL);
                removedSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
        }
        return { removedSpace: removedSpace, removedPiece };
    }

    public put(piece: EncapsulePiece): EncapsuleSpace {
        if (piece === EncapsulePiece.NONE) throw new Error('Cannot put NONE on space');
        const piecePlayer: PlayerOrNone = piece.getPlayer();
        const size: Size = piece.getSize();
        switch (size) {
            case Size.BIG:
                return new EncapsuleSpace(this.small, this.medium, piecePlayer);
            case Size.MEDIUM:
                Utils.assert(this.big.isNone(), 'Cannot put a piece on top of a bigger one');
                return new EncapsuleSpace(this.small, piecePlayer, this.big);
            default:
                Utils.expectToBe(size, Size.SMALL);
                Utils.assert(this.big.isNone(), 'Cannot put a piece on top of a bigger one');
                Utils.assert(this.medium.isNone(), 'Cannot put a piece on top of a bigger one');
                return new EncapsuleSpace(piecePlayer, this.medium, this.big);
        }
    }

    public belongsTo(player: Player): boolean {
        return this.getBiggest().getPlayer() === player;
    }

    public toString(): string {
        const pieceNames: string[] = this.toOrderedPieceNames();
        return '(' + pieceNames[0] + ', ' + pieceNames[1] + ', ' + pieceNames[2] + ')';
    }
}
