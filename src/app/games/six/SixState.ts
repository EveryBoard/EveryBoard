import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Vector';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils, NumberTable } from 'src/app/utils/ArrayUtils';
import { ReversibleMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SixFailure } from './SixFailure';
import { SixMove } from './SixMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { OpenHexagonalGameState } from 'src/app/jscaip/OpenHexagonalGameState';

export class SixState extends OpenHexagonalGameState<Player> {

    public readonly width: number;

    public readonly height: number;

    public readonly offset: Vector;

    public static getInitialState(): SixState {
        const board: NumberTable = [[Player.ZERO.value], [Player.ONE.value]];
        return SixState.fromRepresentation(board, 0);
    }
    public static fromRepresentation(board: NumberTable, turn: number, offset?: Vector): SixState {
        const pieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (board[y][x] !== PlayerOrNone.NONE.value) {
                    pieces.set(new Coord(x, y), Player.of(board[y][x]));
                }
            }
        }
        return new SixState(pieces, turn);
    }
    public movePiece(move: SixMove): SixState {
        const pieces: ReversibleMap<Coord, Player> = this.pieces.getCopy();
        pieces.delete(move.start.get());
        pieces.set(move.landing, this.getCurrentPlayer());
        return new SixState(pieces, this.turn);
    }
    public toRepresentation(): NumberTable {
        const board: number[][] = ArrayUtils.createTable(this.width, this.height, PlayerOrNone.NONE.value);
        for (const piece of this.pieces.listKeys()) {
            const pieceValue: number = this.getPieceAt(piece).value;
            board[piece.y][piece.x] = pieceValue;
        }
        return board;
    }
    public isIllegalLandingZone(landing: Coord, start: MGPOptional<Coord>): MGPValidation {
        if (this.pieces.containsKey(landing)) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        if (this.isCoordConnected(landing, start)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(SixFailure.MUST_DROP_NEXT_TO_OTHER_PIECE());
        }
    }
    public isCoordConnected(coord: Coord, except: MGPOptional<Coord>): boolean {
        for (const dir of HexaDirection.factory.all) {
            const neighbor: Coord = coord.getNext(dir, 1);
            if (this.pieces.containsKey(neighbor) &&
                (except.equalsValue(neighbor) === false))
            {
                return true;
            }
        }
        return false;
    }
    public getPieceAt(coord: Coord): PlayerOrNone {
        if (this.isOnBoard(coord)) {
            return this.pieces.get(coord).get();
        } else {
            return PlayerOrNone.NONE;
        }
    }
    public applyLegalDrop(coord: Coord): SixState {
        const pieces: ReversibleMap<Coord, Player> = this.pieces.getCopy();
        pieces.put(coord, this.getCurrentPlayer());
        return new SixState(pieces, this.turn + 1);
    }
    public applyLegalDeplacement(move: SixMove, kept: MGPSet<Coord>): SixState {
        const stateAfterMove: SixState = this.movePiece(move);

        if (kept.size() > 0) {
            const newPieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            for (const coord of kept) {
                newPieces.set(coord, stateAfterMove.getPieceAt(coord) as Player);
            }
            return new SixState(newPieces, this.turn + 1);
        } else {
            return new SixState(stateAfterMove.pieces, this.turn + 1);
        }

    }
    public countPieces(): [number, number] {
        const pieces: ReversibleMap<Player, MGPSet<Coord>> = this.pieces.reverse();
        const zeroPieces: MGPSet<Coord> = pieces.get(Player.ZERO).getOrElse(new CoordSet());
        const onePieces: MGPSet<Coord> = pieces.get(Player.ONE).getOrElse(new CoordSet());
        return [zeroPieces.size(), onePieces.size()];
    }
    public switchPiece(coord: Coord): SixState {
        const newPieces: ReversibleMap<Coord, Player> = this.pieces.getCopy();
        const oldPiece: PlayerOrNone = this.getPieceAt(coord);
        if (oldPiece.isPlayer()) {
            newPieces.replace(coord, oldPiece.getOpponent());
            return new SixState(newPieces, this.turn);
        } else {
            ErrorLoggerService.logErrorAndFail('SixState', 'Cannot switch piece if there is no piece!', { coord: coord.toString() });
        }
    }
    public equals(other: SixState): boolean {
        return this.turn === other.turn && this.pieces.equals(other.pieces);
    }
}
