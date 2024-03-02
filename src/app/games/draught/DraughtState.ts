import { Player, PlayerOrNone } from '../../jscaip/Player';
import { Utils } from '../../utils/utils';
import { Table } from '../../utils/ArrayUtils';
import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { Coord } from '../../jscaip/Coord';

/**
 * This class represent the state of the game at a specific turn.
 * It should extend `GameState` in the general case, which requires only to include a `turn` field.
 * You can rely on more specific types of boards, depending on your game:
 *   - `GameStateWithTable` for games that use square spaces in a limited rectangular boards (with or without holes).
 *   - `HexagonalGameState` for games that use hexagonal spaces in a limited space.
 *   - `OpenHexagonalGameState` for games that use hexagonal spaces but in an unlimited space,
 *   - `TriangularGameState` for games that use triangular spaces in a limited space.
 *
 * A common pattern is to have a state made of a `Table` (a 2D array) of * `PlayerOrNone` values,
 * where `Player.ZERO` and `Player.ONE` denote the presence of a player piece, while `Player.NONE`
 * denotes the absence of a piece at that location.
 */

export  class DraughtPiece {

    public static readonly ZERO: DraughtPiece = new DraughtPiece(PlayerOrNone.ZERO, false);
    public static readonly ONE: DraughtPiece = new DraughtPiece(PlayerOrNone.ONE, false);
    public static readonly ZERO_QUEEN: DraughtPiece = new DraughtPiece(PlayerOrNone.ZERO, true);
    public static readonly ONE_QUEEN: DraughtPiece = new DraughtPiece(PlayerOrNone.ONE, true);
    public static readonly NONE: DraughtPiece = new DraughtPiece(PlayerOrNone.NONE, false);

    public constructor(public readonly player: PlayerOrNone, public readonly isQueen: boolean) {}

    public toString(): string {
        switch (this) {
            case DraughtPiece.ZERO: return 'o';
            case DraughtPiece.ONE: return 'i';
            case DraughtPiece.ZERO_QUEEN: return 'O';
            case DraughtPiece.ONE_QUEEN: return 'I'
            default:
            Utils.expectToBe(this, DraughtPiece.NONE);
                return '_';
        }
    }

    public equals(other: DraughtPiece): boolean {
        return this === other;
    }
    public isEmpty(): boolean {
        return this === DraughtPiece.NONE;
    }

    public isQueen(): boolean {
        return this.isQueen;
    }

    public isOwnedBy(player: Player): boolean {
        return this.player === player;
    }

    public getOwner(): PlayerOrNone {
        return this.player;
    }

}
export class DraughtState extends GameStateWithTable<DraughtPiece> {
    /**
     * This static method should create the initial state of the game.
     */
    public static readonly SIZE: number = 10;  // TODO make it modifiable

    public static of(board: Table<DraughtPiece>, turn: number): DraughtState {
        return new DraughtState(board, turn);
    }

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(DraughtState.SIZE, DraughtState.SIZE);
    }

    public set(coord: Coord, value: DraughtPiece): DraughtState {
        const newBoard: DraughtPiece[][] = this.getCopiedBoard();
        newBoard[coord.y][coord.x] = value;
        return new DraughtState(newBoard, this.turn);
    }

    public remove(coord: Coord): DraughtState {
        return this.set(coord, DraughtPiece.NONE);
    }

    public getPieceOf(player: Player): Coord[] {
        const pieceCoord: Coord[] = [];
        for (let y: number = 0; y < DraughtState.SIZE; y++) {
            for (let x: number = 0; x < DraughtState.SIZE; x++) {
                if (this.getPieceAtXY(x,y).isOwnedBy(player)){
                    pieceCoord.push(new Coord(x, y));
                }
            }
        }
        return pieceCoord;
    }

}
