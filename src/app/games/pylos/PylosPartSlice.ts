import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';
import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';

export class PylosPartSlice extends GamePartSlice {
    public static getInitialSlice(): PylosPartSlice {
        const board0: number[][] = ArrayUtils.createBiArray(4, 4, Player.NONE.value);
        const board1: number[][] = ArrayUtils.createBiArray(3, 3, Player.NONE.value);
        const board2: number[][] = ArrayUtils.createBiArray(2, 2, Player.NONE.value);
        const board3: number[][] = [[Player.NONE.value]];
        const turn = 0;
        return new PylosPartSlice([board0, board1, board2, board3], turn);
    }
    constructor(public readonly boards: Table<ReadonlyArray<number>>,
        turn: number) {
        super([], turn);
    }
    public getBoardAt(coord: PylosCoord): number {
        return this.boards[coord.z][coord.y][coord.x];
    }
    public applyLegalMove(move: PylosMove): PylosPartSlice {
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
    public setBoardAts(coordValues: {coord: PylosCoord, value: Player}[], turn: number): PylosPartSlice {
        const newBoard: number[][][] = [
            ArrayUtils.copyBiArray(this.boards[0]),
            ArrayUtils.copyBiArray(this.boards[1]),
            ArrayUtils.copyBiArray(this.boards[2]),
            ArrayUtils.copyBiArray(this.boards[3]),
        ];

        for (const coordValue of coordValues) {
            const coord: PylosCoord = coordValue.coord;
            const value: number = coordValue.value.value;
            newBoard[coord.z][coord.y][coord.x] = value;
        }
        return new PylosPartSlice(newBoard, turn);
    }
    public isLandable(coord: PylosCoord): boolean {
        if (this.getBoardAt(coord) !== Player.NONE.value) return false;
        if (coord.z === 0) return true;
        const lowerPieces: PylosCoord[] = coord.getLowerPieces();
        for (const lowerPiece of lowerPieces) {
            if (this.getBoardAt(lowerPiece) === Player.NONE.value) {
                return false;
            }
        }
        return true;
    }
    public isSupporting(coord: PylosCoord): boolean {
        if (coord.z === 3) return false;
        const higherPieces: PylosCoord[] = coord.getHigherPieces();
        for (const higherPiece of higherPieces) {
            if (this.getBoardAt(higherPiece) !== Player.NONE.value) return true;
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
                    const v: number = this.getBoardAt(c);
                    ownershipMap[v] = 1 + ownershipMap[v];
                }
            }
        }
        return ownershipMap;
    }
}
