import { GameState } from 'src/app/jscaip/GameState';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, NumberTable } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { ApagosCoord } from './ApagosCoord';
import { ApagosSquare } from './ApagosSquare';

export class ApagosState extends GameState<ApagosCoord, ApagosSquare> {

    public static PIECES_PER_PLAYER: number = 10;

    public static getInitialState(): ApagosState {
        return ApagosState.fromRepresentation(0, [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], this.PIECES_PER_PLAYER, this.PIECES_PER_PLAYER);
    }
    public static fromRepresentation(turn: number, board: NumberTable, nbZero: number, nbOne: number): ApagosState {
        const squares: ApagosSquare[] = [];
        for (let x: number = 0; x < 4; x++) {
            const nbZero: number = board[0][x];
            const nbOne: number = board[1][x];
            const nbTotal: number = board[2][x];
            const square: ApagosSquare = ApagosSquare.from(nbZero, nbOne, nbTotal).get();
            squares.push(square);
        }
        const remaining: MGPMap<Player, number> = new MGPMap();
        remaining.set(Player.ZERO, nbZero);
        remaining.set(Player.ONE, nbOne);
        return new ApagosState(turn, squares, remaining);
    }
    public constructor(turn: number,
                       public readonly board: ReadonlyArray<ApagosSquare>,
                       public readonly remaining: MGPMap<Player, number>)
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
        const remaining: MGPMap<Player, number> = this.getRemainingCopy();
        return new ApagosState(this.turn, newBoard, remaining);
    }
    public getRemainingCopy(): MGPMap<Player, number> {
        return this.remaining.getCopy();
    }
    public isOnBoard(coord: ApagosCoord): boolean {
        // TODOTODO: delete when strictness is merged
        return coord != null;
    }
    public getNullable(coord: ApagosCoord): ApagosSquare {
        // TODOTODO: delete when strictness is merged
        if (coord == null) {
            return null;
        }
        return this.board[coord.x];
    }
    public getRemaining(piece: Player): number {
        return this.remaining.get(piece).get();
    }
    public equals(other: ApagosState): boolean {
        return this.turn === other.turn &&
               ArrayUtils.compareArray(other.board, this.board) &&
               this.remaining.equals(other.remaining);
    }
}
