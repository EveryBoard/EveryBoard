import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { Utils } from 'src/app/utils/utils';

/**
 * Represent half a tile
 * owner: to make us know which half of a tile it is (since trexo tiles are bicolor)
 * tileId: we need this info to enforce the "don't play on only one tile" rules
 *     it is filled with the turn at which the tile is dropped
 */
export class TrexoPiece {

    public constructor(public readonly owner: PlayerOrNone,
                       public readonly tileId: number)
    {
    }
    public toString(): string {
        return `TrexoPiece(${ this.owner.toString() }, ${ this.tileId })`;
    }
}

export class TrexoPieceStack {

    public static EMPTY: TrexoPieceStack = TrexoPieceStack.of([]);

    public static of(pieces: ReadonlyArray<TrexoPiece>): TrexoPieceStack {
        let previousTurn: number = -1;
        for (const piece of pieces) {
            assert(previousTurn < piece.tileId, 'TrexoPieceStack: dropped turn should be ascending');
            previousTurn = piece.tileId;
        }
        return new TrexoPieceStack(pieces);
    }
    private constructor(private readonly pieces: ReadonlyArray<TrexoPiece>) {}

    public getHeight(): number {
        return this.pieces.length;
    }
    public getOwner(): PlayerOrNone {
        const numberOfPiece: number = this.pieces.length;
        if (numberOfPiece === 0) {
            return PlayerOrNone.NONE;
        } else {
            const lastPiece: TrexoPiece = this.pieces[numberOfPiece - 1];
            return lastPiece.owner;
        }
    }
    public getUpperTileId(): number {
        const numberOfPiece: number = this.pieces.length;
        if (numberOfPiece === 0) {
            return -1;
        } else {
            const lastPiece: TrexoPiece = this.pieces[numberOfPiece - 1];
            return lastPiece.tileId;
        }
    }
    public add(piece: TrexoPiece): TrexoPieceStack {
        return TrexoPieceStack.of(this.pieces.concat(piece));
    }
    public getPieceAt(z: number): TrexoPiece {
        assert(z < this.pieces.length, 'no element ' + z + 'in piece!');
        return this.pieces[z];
    }
    public isGround(): boolean {
        return this.getUpperTileId() === -1;
    }
    public toString(): string {
        return '[' + this.pieces.map((piece: TrexoPiece) => {
            return '(' + piece.toString() + ')';
        }).join(' ') + ']';
    }
}

export class TrexoState extends GameStateWithTable<TrexoPieceStack> {

    public static readonly SIZE: number = 10;

    public static getInitialState(): TrexoState {
        const board: TrexoPieceStack[][] = ArrayUtils.createTable(TrexoState.SIZE,
                                                                  TrexoState.SIZE,
                                                                  TrexoPieceStack.EMPTY);
        return new TrexoState(board, 0);
    }
    public static of(board: TrexoPieceStack[][], turn: number): TrexoState {
        Utils.assert(board.length === TrexoState.SIZE, 'Invalid board dimensions');
        for (const lines of board) {
            Utils.assert(lines.length === TrexoState.SIZE, 'Invalid board dimensions');
        }
        return new TrexoState(board, turn);
    }
    public drop(coord: Coord, player: Player): TrexoState {
        const newBoard: TrexoPieceStack[][] = this.getCopiedBoard();
        const droppedPiece: TrexoPiece = new TrexoPiece(player, this.turn);
        newBoard[coord.y][coord.x] = newBoard[coord.y][coord.x].add(droppedPiece);
        return new TrexoState(newBoard, this.turn);
    }
    public incrementTurn(): TrexoState {
        return new TrexoState(this.getCopiedBoard(), this.turn + 1);
    }
    public override toString(): string {
        return this.board.map((list: TrexoPieceStack[]) => {
            return '[' + list.map((space: TrexoPieceStack) => {
                return 'TrexoPieceStack.from(' + space.toString() + ')';
            }).join(', ') + ']';
        }).join('\n,');
    }
    public getPieceAtXYZ(x: number, y: number, z: number): TrexoPiece {
        const stack: TrexoPieceStack = this.getPieceAtXY(x, y);
        return stack.getPieceAt(z);
    }
}
