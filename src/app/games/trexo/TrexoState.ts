import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class TrexoStateFailure {
    public static readonly INVALID_DIMENSIONS: Localized = () => $localize`TODOTODO: INVALID_DIMENSIONS`;
}

export class TrexoSpace {

    public static EMPTY: TrexoSpace = new TrexoSpace(PlayerOrNone.NONE, 0, -1);

    constructor(public readonly owner: PlayerOrNone,
                public readonly height: number,
                public readonly landingTurn: number)
    {
    }
    public toString(): string {
        let player: string = '';
        switch (this.owner) {
            case PlayerOrNone.ZERO:
                player = 'O';
                break;
            case PlayerOrNone.ONE:
                player = 'X';
                break;
            default:
                player = '_';
                break;
        }
        return '(' + player + ', ' + this.height + ', ' + this.landingTurn + ')';
    }
}

export class TrexoState extends GameStateWithTable<TrexoSpace> {

    public static readonly SIZE: number = 10;

    public static getInitialState(): TrexoState {
        const board: TrexoSpace[][] = ArrayUtils.createTable(TrexoState.SIZE, TrexoState.SIZE, TrexoSpace.EMPTY);
        return new TrexoState(board, 0);
    }
    public static from(board: TrexoSpace[][], turn: number): MGPFallible<TrexoState> {
        if (board.length !== TrexoState.SIZE) {
            return MGPFallible.failure(TrexoStateFailure.INVALID_DIMENSIONS());
        }
        for (const lines of board) {
            if (lines.length !== TrexoState.SIZE) {
                return MGPFallible.failure(TrexoStateFailure.INVALID_DIMENSIONS());
            }
        }
        return MGPFallible.success(new TrexoState(board, turn));
    }
    public drop(coord: Coord, player: Player): TrexoState {
        const oldHeight: number = this.getPieceAt(coord).height;
        const newBoard: TrexoSpace[][] = this.getCopiedBoard();
        newBoard[coord.y][coord.x] = new TrexoSpace(player, oldHeight + 1, this.turn);
        return new TrexoState(newBoard, this.turn);
    }
    public incrementTurn(): TrexoState {
        return new TrexoState(this.getCopiedBoard(), this.turn + 1);
    }
    public toString(): string {
        return this.board.map((list: TrexoSpace[]) => {
            return list.map((space: TrexoSpace) => {
                return '(' + space.toString() + ')';
            }).join(' ');
        }).join('\n');
    }
}
