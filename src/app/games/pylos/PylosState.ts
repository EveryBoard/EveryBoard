import { Table, TableUtils } from 'src/app/jscaip/TableUtils';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';
import { Set, Utils } from '@everyboard/lib';
import { GameState } from 'src/app/jscaip/state/GameState';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

export class PylosState extends GameState {

    public static getLevelRange(z: number): number[] {
        switch (z) {
            case 0: return [0, 1, 2, 3];
            case 1: return [0, 1, 2];
            default:
                Utils.expectToBe(z, 2);
                return [0, 1];
        }
    }

    public constructor(public readonly boards: Table<ReadonlyArray<PlayerOrNone>>,
                       turn: number)
    {
        super(turn);
    }

    public getPieceAt(coord: PylosCoord): PlayerOrNone {
        return this.boards[coord.z][coord.y][coord.x];
    }

    public applyLegalMove(move: PylosMove, increment: boolean = true): PylosState {
        const updateValues: { coord: PylosCoord, value: PlayerOrNone }[] = [];
        updateValues.push({ coord: move.landingCoord, value: this.getCurrentPlayer() });
        if (move.startingCoord.isPresent()) {
            updateValues.push({ coord: move.startingCoord.get(), value: PlayerOrNone.NONE });
        }
        if (move.firstCapture.isPresent()) {
            updateValues.push({ coord: move.firstCapture.get(), value: PlayerOrNone.NONE });
        }
        if (move.secondCapture.isPresent()) {
            updateValues.push({ coord: move.secondCapture.get(), value: PlayerOrNone.NONE });
        }
        let turn: number;
        if (increment) {
            turn = this.turn + 1;
        } else {
            turn = this.turn;
        }
        return this.setBoardAtCoords(updateValues, turn);
    }

    public setBoardAtCoords(coordValues: {coord: PylosCoord, value: PlayerOrNone}[], turn: number): PylosState {
        const newBoard: PlayerOrNone[][][] = [
            TableUtils.copy(this.boards[0]),
            TableUtils.copy(this.boards[1]),
            TableUtils.copy(this.boards[2]),
            TableUtils.copy(this.boards[3]),
        ];

        for (const coordValue of coordValues) {
            const coord: PylosCoord = coordValue.coord;
            const value: PlayerOrNone = coordValue.value;
            newBoard[coord.z][coord.y][coord.x] = value;
        }
        return new PylosState(newBoard, turn);
    }

    public isLandable(coord: PylosCoord): boolean {
        if (this.getPieceAt(coord).isPlayer()) {
            return false;
        }
        if (coord.z === 0) return true;
        const lowerPieces: PylosCoord[] = coord.getLowerPieces();
        for (const lowerPiece of lowerPieces) {
            if (this.getPieceAt(lowerPiece).isNone()) {
                return false;
            }
        }
        return true;
    }

    public isSupporting(coord: PylosCoord): boolean {
        if (coord.z === 3) return false;
        const higherPieces: PylosCoord[] = coord.getHigherCoords();
        for (const higherPiece of higherPieces) {
            if (this.getPieceAt(higherPiece).isPlayer()) {
                return true;
            }
        }
        return false;
    }

    public getPiecesRepartition(): PlayerNumberMap {
        const ownershipMap: PlayerNumberMap = PlayerNumberMap.of(0, 0);
        for (let z: number = 0; z < 3; z++) {
            for (let y: number = 0; y < (4 - z); y++) {
                for (let x: number = 0; x < (4 - z); x++) {
                    const c: PylosCoord = new PylosCoord(x, y, z);
                    const v: PlayerOrNone = this.getPieceAt(c);
                    if (v.isPlayer()) {
                        ownershipMap.add(v, 1);
                    }
                }
            }
        }
        return ownershipMap;
    }

    public removePieceAt(coord: PylosCoord): PylosState {
        const removeCoord: {coord: PylosCoord, value: PlayerOrNone} = {
            coord,
            value: PlayerOrNone.NONE,
        };
        return this.setBoardAtCoords([removeCoord], this.turn);
    }

    public dropCurrentPlayersPieceAt(coord: PylosCoord): PylosState {
        const addedCoord: {coord: PylosCoord, value: PlayerOrNone} = {
            coord,
            value: this.getCurrentPlayer(),
        };
        return this.setBoardAtCoords([addedCoord], this.turn);
    }

    public getFreeToMoves(): Set<PylosCoord> {
        const freeToMove: PylosCoord[] = [];
        const currentPlayer: Player = this.getCurrentPlayer();
        for (let z: number = 0; z <= 2; z++) {
            const levelRange: number[] = PylosState.getLevelRange(z);
            for (const y of levelRange) {
                for (const x of levelRange) {
                    const coord: PylosCoord = new PylosCoord(x, y, z);
                    if (this.getPieceAt(coord).equals(currentPlayer) &&
                        this.isSupporting(coord) === false)
                    {
                        freeToMove.push(coord);
                    }
                }
            }
        }
        return new Set(freeToMove);
    }
}
