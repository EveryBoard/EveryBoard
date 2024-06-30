import { GameState } from 'src/app/jscaip/state/GameState';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from '@everyboard/lib';
import { ApagosSquare } from './ApagosSquare';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Table } from 'src/app/jscaip/TableUtils';

export class ApagosState extends GameState {

    /**
     * The representation works as follows: board is made of three rows:
     * - the first row contains the number of pieces from player 0, in each square
     * - the second row contains the number of pieces from player 1, in each square
     * - the third row contains the size of each square
     */
    public static fromRepresentation(turn: number, board: Table<number>, nZero: number, nOne: number): ApagosState {
        const squares: ApagosSquare[] = [];
        for (let x: number = 0; x < board[0].length; x++) {
            const localZeroCount: number = board[0][x];
            const localOneCount: number = board[1][x];
            const nbTotal: number = board[2][x];
            const square: ApagosSquare = ApagosSquare.from(localZeroCount, localOneCount, nbTotal).get();
            squares.push(square);
        }
        const remaining: PlayerNumberMap = PlayerNumberMap.of(nZero, nOne);
        return new ApagosState(turn, squares, remaining);
    }

    public constructor(turn: number,
                       public readonly board: ReadonlyArray<ApagosSquare>,
                       public readonly remaining: PlayerNumberMap)
    {
        super(turn);
        this.remaining.makeImmutable();
    }

    public getPieceAt(x: number): ApagosSquare {
        return this.board[x];
    }

    public updateAt(x: number, newSquare: ApagosSquare): ApagosState {
        const newBoard: ApagosSquare[] = [];
        for (let pos: number = 0; pos < this.board.length; pos++) {
            if (pos === x) {
                newBoard.push(newSquare);
            } else {
                newBoard.push(this.board[pos]);
            }
        }
        const remaining: PlayerNumberMap = this.getRemainingCopy();
        return new ApagosState(this.turn, newBoard, remaining);
    }

    public getRemainingCopy(): PlayerNumberMap {
        return this.remaining.getCopy();
    }

    public getRemaining(piece: Player): number {
        return this.remaining.get(piece);
    }

    public getMaxPiecesPerPlayer(): number {
        let numberOfPieces: number = 0; // number of piece should be just enough to have the majority everywhere
        for (const square of this.board) {
            numberOfPieces += Math.floor(square.getCapacity() / 2) + 1; // works both for even or odd sizes
        }
        return numberOfPieces;
    }

    public equals(other: ApagosState): boolean {
        return this.turn === other.turn &&
               ArrayUtils.equals(other.board, this.board) &&
               this.remaining.equals(other.remaining);
    }

    public override toString(): string {
        return `[${this.board.map((square: ApagosSquare) => square.toString()).join(', ')}]`;
    }
}
