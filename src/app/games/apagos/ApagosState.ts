import { GameState } from 'src/app/jscaip/GameState';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { ApagosCoord } from './ApagosCoord';
import { ApagosSquare } from './ApagosSquare';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

export class ApagosState extends GameState {

    public static fromRepresentation(turn: number, board: Table<number>, nbZero: number, nbOne: number): ApagosState {
        const squares: ApagosSquare[] = [];
        for (let x: number = 0; x < 4; x++) {
            const nbZero: number = board[0][x];
            const nbOne: number = board[1][x];
            const nbTotal: number = board[2][x];
            const square: ApagosSquare = ApagosSquare.from(nbZero, nbOne, nbTotal).get();
            squares.push(square);
        }
        const remaining: PlayerNumberMap = PlayerNumberMap.of(nbZero, nbOne);
        return new ApagosState(turn, squares, remaining);
    }

    public constructor(turn: number,
                       public readonly board: ReadonlyArray<ApagosSquare>,
                       public readonly remaining: PlayerNumberMap)
    {
        super(turn);
        this.remaining.makeImmutable();
    }

    public getPieceAt(coord: ApagosCoord): ApagosSquare {
        return this.board[coord.x];
    }

    public updateAt(coord: ApagosCoord, newSquare: ApagosSquare): ApagosState {
        const newBoard: ApagosSquare[] = [];
        for (let x: number = 0; x < 4; x++) {
            if (coord.x === x) {
                newBoard.push(newSquare);
            } else {
                newBoard.push(this.board[x]);
            }
        }
        const remaining: PlayerNumberMap = this.getRemainingCopy();
        return new ApagosState(this.turn, newBoard, remaining);
    }

    public getRemainingCopy(): PlayerNumberMap {
        return this.remaining.getCopy();
    }

    public getRemaining(piece: Player): number {
        return this.remaining.get(piece).get();
    }

    public equals(other: ApagosState): boolean {
        return this.turn === other.turn &&
               ArrayUtils.equals(other.board, this.board) &&
               this.remaining.equals(other.remaining);
    }
}
