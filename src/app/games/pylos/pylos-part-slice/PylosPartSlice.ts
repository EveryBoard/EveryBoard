import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { Player } from "src/app/jscaip/Player";
import { PylosCoord } from "../pylos-coord/PylosCoord";
import { PylosMove } from "../pylos-move/PylosMove";

export class PylosPartSlice extends GamePartSlice {

    public static getStartingSlice(): PylosPartSlice {
        const board0: number[][] = ArrayUtils.createBiArray(4, 4, Player.NONE.value);
        const board1: number[][] = ArrayUtils.createBiArray(3, 3, Player.NONE.value);
        const board2: number[][] = ArrayUtils.createBiArray(2, 2, Player.NONE.value);
        const board3: number = Player.NONE.value;
        const turn: number = 0;
        return new PylosPartSlice(board0, board1, board2, board3, turn);
    }
    constructor(board: number[][],
                public readonly board1: ReadonlyArray<ReadonlyArray<number>>,
                public readonly board2: ReadonlyArray<ReadonlyArray<number>>,
                public readonly board3: number,
                turn: number) {
        super(board, turn);
    }
    public getBoardAt(coord: PylosCoord): number {
        switch (coord.z) {
            case 0: return this.board[coord.y][coord.x];
            case 1: return this.board1[coord.y][coord.x];
            case 2: return this.board2[coord.y][coord.x];
            case 3: return this.board3;
            default: throw new Error("Out of range Z value: " + coord.z);
        }
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
        const newBoard0: number[][] = ArrayUtils.copyBiArray(this.board);
        const newBoard1: number[][] = ArrayUtils.copyBiArray(this.board1);
        const newBoard2: number[][] = ArrayUtils.copyBiArray(this.board2);
        let newBoard3: number = this.board3;
        for (const coordValue of coordValues) {
            const coord: PylosCoord = coordValue.coord;
            const value: number = coordValue.value.value;
            switch (coord.z) {
                case 0: newBoard0[coord.y][coord.x] = value; break;
                case 1: newBoard1[coord.y][coord.x] = value; break;
                case 2: newBoard2[coord.y][coord.x] = value; break;
                case 3: newBoard3 = value; break;
            }
        }
        return new PylosPartSlice(newBoard0, newBoard1, newBoard2, newBoard3, turn);
    }
    public isLandable(coord: PylosCoord): boolean {
        if (this.getBoardAt(coord) !== Player.NONE.value) return false;
        if (coord.z === 0) return true;
        const lowerPieces: PylosCoord[] = coord.getLowerPieces();
        for (let lowerPiece of lowerPieces) {
            if (this.getBoardAt(lowerPiece) === Player.NONE.value)
                return false;
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
                    let c: PylosCoord = new PylosCoord(x, y, z);
                    let v: number = this.getBoardAt(c);
                    ownershipMap[v] = 1 + ownershipMap[v];
                }
            }
        }
        return ownershipMap;
    }
}