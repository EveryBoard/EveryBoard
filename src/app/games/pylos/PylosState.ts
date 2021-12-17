import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Player } from 'src/app/jscaip/Player';
import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';
import { GameState } from 'src/app/jscaip/GameState';

export class PylosState extends GameState {

    public static getInitialState(): PylosState {
        const board0: Player[][] = ArrayUtils.createTable(4, 4, Player.NONE);
        const board1: Player[][] = ArrayUtils.createTable(3, 3, Player.NONE);
        const board2: Player[][] = ArrayUtils.createTable(2, 2, Player.NONE);
        const board3: Player[][] = [[Player.NONE]];
        const turn: number = 0;
        return new PylosState([board0, board1, board2, board3], turn);
    }
    constructor(public readonly boards: Table<ReadonlyArray<Player>>,
                turn: number)
    {
        super(turn);
    }
    public isOnBoard(coord: PylosCoord): boolean {
        return this.getPieceAt(coord) != null;
    }
    public getPieceAt(coord: PylosCoord): Player {
        return this.boards[coord.z][coord.y][coord.x];
    }
    public applyLegalMove(move: PylosMove): PylosState {
        const updateValues: { coord: PylosCoord, value: Player }[] = [];
        updateValues.push({ coord: move.landingCoord, value: this.getCurrentPlayer() });
        if (move.startingCoord.isPresent()) {
            updateValues.push({ coord: move.startingCoord.get(), value: Player.NONE });
        }
        if (move.firstCapture.isPresent()) {
            updateValues.push({ coord: move.firstCapture.get(), value: Player.NONE });
        }
        if (move.secondCapture.isPresent()) {
            updateValues.push({ coord: move.secondCapture.get(), value: Player.NONE });
        }
        return this.setBoardAts(updateValues, this.turn + 1);
    }
    public setBoardAts(coordValues: {coord: PylosCoord, value: Player}[], turn: number): PylosState {
        const newBoard: Player[][][] = [
            ArrayUtils.copyBiArray(this.boards[0]),
            ArrayUtils.copyBiArray(this.boards[1]),
            ArrayUtils.copyBiArray(this.boards[2]),
            ArrayUtils.copyBiArray(this.boards[3]),
        ];

        for (const coordValue of coordValues) {
            const coord: PylosCoord = coordValue.coord;
            const value: Player = coordValue.value;
            newBoard[coord.z][coord.y][coord.x] = value;
        }
        return new PylosState(newBoard, turn);
    }
    public isLandable(coord: PylosCoord): boolean {
        if (this.getPieceAt(coord) !== Player.NONE) return false;
        if (coord.z === 0) return true;
        const lowerPieces: PylosCoord[] = coord.getLowerPieces();
        for (const lowerPiece of lowerPieces) {
            if (this.getPieceAt(lowerPiece) === Player.NONE) {
                return false;
            }
        }
        return true;
    }
    public isSupporting(coord: PylosCoord): boolean {
        if (coord.z === 3) return false;
        const higherPieces: PylosCoord[] = coord.getHigherPieces();
        for (const higherPiece of higherPieces) {
            if (this.getPieceAt(higherPiece) !== Player.NONE) return true;
        }
        return false;
    }
    public getPiecesRepartition(): { [owner: number]: number } {
        const ownershipMap: { [owner: number]: number } = {};
        ownershipMap[Player.NONE.value] = 0;
        ownershipMap[Player.ZERO.value] = 0;
        ownershipMap[Player.ONE.value] = 0;
        for (let z: number = 0; z < 3; z++) {
            for (let y: number = 0; y < (4 - z); y++) {
                for (let x: number = 0; x < (4 - z); x++) {
                    const c: PylosCoord = new PylosCoord(x, y, z);
                    const v: Player = this.getPieceAt(c);
                    ownershipMap[v.value] = 1 + ownershipMap[v.value];
                }
            }
        }
        return ownershipMap;
    }
}
