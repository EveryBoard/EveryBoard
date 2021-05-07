import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { EncapsulePiece, Size } from 'src/app/games/encapsule/EncapsulePiece';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/utils';
import { Coord } from 'src/app/jscaip/Coord';
import { ComparableObject } from 'src/app/utils/Comparable';

export class EncapsulePartSlice extends GamePartSlice {
    private readonly remainingPieces: ReadonlyArray<EncapsulePiece>;
    private readonly caseBoard: Table<EncapsuleCase>;

    constructor(board: number[][], turn: number, remainingPieces: EncapsulePiece[]) {
        super(board, turn);
        if (remainingPieces == null) throw new Error('RemainingPieces cannot be null');
        this.remainingPieces = remainingPieces;
        this.caseBoard = this.board.map((line: number[]) =>
            line.map((n: number) => EncapsuleCase.decode(n)));
    }
    public static getInitialSlice(): EncapsulePartSlice {
        const emptyCase: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
        const emptyNumber: number = emptyCase.encode();
        const startingBoard: number[][] = ArrayUtils.createBiArray(3, 3, emptyNumber);
        const initialPieces: EncapsulePiece[] = [
            EncapsulePiece.BIG_BLACK, EncapsulePiece.BIG_BLACK, EncapsulePiece.BIG_WHITE,
            EncapsulePiece.BIG_WHITE, EncapsulePiece.MEDIUM_BLACK, EncapsulePiece.MEDIUM_BLACK,
            EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.SMALL_BLACK,
            EncapsulePiece.SMALL_BLACK, EncapsulePiece.SMALL_WHITE, EncapsulePiece.SMALL_WHITE,
        ];
        return new EncapsulePartSlice(startingBoard, 0, initialPieces);
    }
    public getAt(coord: Coord): EncapsuleCase {
        return this.caseBoard[coord.y][coord.x];
    }
    public getRemainingPieces(): EncapsulePiece[] {
        return ArrayUtils.copyImmutableArray(this.remainingPieces);
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
    public toCaseBoard(): Table<EncapsuleCase> {
        return this.caseBoard;
    }
    public getPlayerRemainingPieces(): EncapsulePiece[] {
        return this.remainingPieces.filter((piece: EncapsulePiece) => this.pieceBelongsToCurrentPlayer(piece));
    }
}

export class EncapsuleCase implements ComparableObject {

    public static readonly EMPTY: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);

    public readonly small: Player;

    public readonly medium: Player;

    public readonly big: Player;

    public static decode(encapsuleCase: number): EncapsuleCase {
        assert(encapsuleCase % 1 === 0, 'EncapsuleCase must be encoded as integer: ' + encapsuleCase);
        assert(encapsuleCase >= 0, 'To small representation for EncapsuleCase: ' + encapsuleCase);
        assert(encapsuleCase <= 26, 'To big representation for EncapsuleCase: ' + encapsuleCase);
        const small: Player = Player.of(encapsuleCase%3);
        encapsuleCase -= small.value;
        encapsuleCase/=3;
        const medium: Player = Player.of(encapsuleCase%3);
        encapsuleCase -= medium.value;
        encapsuleCase/=3;
        const big: Player = Player.of(encapsuleCase);
        return new EncapsuleCase(small, medium, big);
    }
    constructor(small: Player, medium: Player, big: Player) {
        if (small == null) throw new Error('Small cannot be null');
        if (medium == null) throw new Error('Medium cannot be null');
        if (big == null) throw new Error('Big cannot be null');
        this.small = small;
        this.medium = medium;
        this.big = big;
    }
    public isEmpty(): boolean {
        return this.small === Player.NONE && this.medium === Player.NONE && this.big === Player.NONE;
    }
    public toList(): EncapsulePiece[] {
        const l: EncapsulePiece[] = [];
        if (this.small !== Player.NONE) l.push(EncapsulePiece.ofSizeAndPlayer(Size.SMALL, this.small));
        if (this.medium !== Player.NONE) l.push(EncapsulePiece.ofSizeAndPlayer(Size.MEDIUM, this.medium));
        if (this.big !== Player.NONE) l.push(EncapsulePiece.ofSizeAndPlayer(Size.BIG, this.big));
        return l;
    }
    public toOrderedPieceNames(): string[] {
        const smallPiece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.SMALL, this.small);
        const mediumPiece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.MEDIUM, this.medium);
        const bigPiece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.BIG, this.big);
        return [smallPiece.toString(), mediumPiece.toString(), bigPiece.toString()];
    }
    public getBiggest(): EncapsulePiece {
        if (this.big === Player.ZERO) return EncapsulePiece.BIG_BLACK;
        if (this.big === Player.ONE) return EncapsulePiece.BIG_WHITE;
        if (this.medium === Player.ZERO) return EncapsulePiece.MEDIUM_BLACK;
        if (this.medium === Player.ONE) return EncapsulePiece.MEDIUM_WHITE;
        if (this.small === Player.ZERO) return EncapsulePiece.SMALL_BLACK;
        if (this.small === Player.ONE) return EncapsulePiece.SMALL_WHITE;
        return EncapsulePiece.NONE;
    }
    public tryToSuperposePiece(piece: EncapsulePiece): MGPOptional<EncapsuleCase> {
        const biggestPresent: Size = this.getBiggest().getSize();
        if (piece === EncapsulePiece.NONE) {
            throw new Error('Cannot move NONE on a case');
        }
        if (piece.getSize() > biggestPresent) {
            return MGPOptional.of(this.put(piece));
        } else {
            return MGPOptional.empty();
        }
    }
    public removeBiggest(): {removedCase: EncapsuleCase, removedPiece: EncapsulePiece} {
        const removedPiece: EncapsulePiece = this.getBiggest();
        if (removedPiece === EncapsulePiece.NONE) {
            throw new Error('Cannot removed piece from empty case');
        }
        let removedCase: EncapsuleCase;
        switch (removedPiece.getSize()) {
            case Size.BIG:
                removedCase = new EncapsuleCase(this.small, this.medium, Player.NONE);
                break;
            case Size.MEDIUM:
                removedCase = new EncapsuleCase(this.small, Player.NONE, Player.NONE);
                break;
            case Size.SMALL:
                removedCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
                break;
        }
        return { removedCase, removedPiece };
    }
    public put(piece: EncapsulePiece): EncapsuleCase {
        if (piece === EncapsulePiece.NONE) throw new Error('Cannot put NONE on case');
        const piecePlayer: Player = piece.getPlayer();
        switch (piece.getSize()) {
            case Size.BIG:
                return new EncapsuleCase(this.small, this.medium, piecePlayer);
            case Size.MEDIUM:
                assert(this.big === Player.NONE, 'Cannot put a piece on top of a bigger one');
                return new EncapsuleCase(this.small, piecePlayer, this.big);
            case Size.SMALL:
                assert(this.big === Player.NONE, 'Cannot put a piece on top of a bigger one');
                assert(this.medium === Player.NONE, 'Cannot put a piece on top of a bigger one');
                return new EncapsuleCase(piecePlayer, this.medium, this.big);
        }
    }
    public encode(): number {
        return this.small.value +
               this.medium.value*3 +
               this.big.value*9;
    }
    public belongsTo(player: Player): boolean {
        return this.getBiggest().getPlayer() === player;
    }
    public equals(o: EncapsuleCase): boolean {
        throw new Error('EncapsuleCase.equals is needed! Blame the dev!' + o.toString());
    }
    public toString(): string {
        const pieceNames: string[] = this.toOrderedPieceNames();
        return '(' + pieceNames[0] + ', ' + pieceNames[1] + ', ' + pieceNames[2] + ')';
    }
}
