import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { TriangularGameState } from 'src/app/jscaip/TriangularGameState';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { Table } from 'src/app/utils/ArrayUtils';
import { assert, display } from 'src/app/utils/utils';
import { CoerceoMove, CoerceoStep } from './CoerceoMove';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class CoerceoState extends TriangularGameState<FourStatePiece> {

    public static VERBOSE: boolean = false;

    public static readonly NEIGHBOORS_TILES_DIRECTIONS: ReadonlyArray<Vector> = [
        new Vector(+0, -2), // UP
        new Vector(+3, -1), // UP_RIGHT
        new Vector(+3, +1), // DOWN_RIGHT
        new Vector(+0, +2), // DOWN
        new Vector(-3, +1), // DOWN_LEFT
        new Vector(-3, -1), // UP_LEFT
    ];
    public static getTilesUpperLeftCoord(tile: Coord): Coord {
        const x: number = tile.x - (tile.x % 3);
        let y: number = tile.y;
        if (x % 2 === 0) {
            y -= (tile.y) % 2;
        } else {
            y -= (tile.y + 1) % 2;
        }
        return new Coord(x, y);
    }
    public static isInRange: (c: Coord) => boolean = (coord: Coord) => {
        return coord.isInRange(15, 10);
    };
    public static getPresentNeighboorEntrances(tileUpperLeft: Coord): Coord[] {
        return [
            new Coord(tileUpperLeft.x + 1, tileUpperLeft.y - 1), // UP
            new Coord(tileUpperLeft.x + 3, tileUpperLeft.y + 0), // UP-RIGHT
            new Coord(tileUpperLeft.x + 3, tileUpperLeft.y + 1), // DOWN-RIGHT
            new Coord(tileUpperLeft.x + 1, tileUpperLeft.y + 2), // DOWN
            new Coord(tileUpperLeft.x - 1, tileUpperLeft.y + 1), // DOWN-LEFT
            new Coord(tileUpperLeft.x - 1, tileUpperLeft.y + 0), // UP-LEFT
        ].filter(CoerceoState.isInRange);
    }
    public static getInitialState(): CoerceoState {
        const _: FourStatePiece = FourStatePiece.EMPTY;
        const N: FourStatePiece = FourStatePiece.NONE;
        const O: FourStatePiece = FourStatePiece.ZERO;
        const X: FourStatePiece = FourStatePiece.ONE;
        const board: Table<FourStatePiece> = [
            [N, N, N, N, N, N, O, _, O, N, N, N, N, N, N],
            [N, N, N, _, _, O, _, _, _, O, _, _, N, N, N],
            [_, X, _, X, _, _, O, _, O, _, _, X, _, X, _],
            [X, _, _, _, X, _, _, _, _, _, X, _, _, _, X],
            [_, X, _, X, _, _, _, _, _, _, _, X, _, X, _],
            [_, O, _, O, _, _, _, _, _, _, _, O, _, O, _],
            [O, _, _, _, O, _, _, _, _, _, O, _, _, _, O],
            [_, O, _, O, _, _, X, _, X, _, _, O, _, O, _],
            [N, N, N, _, _, X, _, _, _, X, _, _, N, N, N],
            [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
        ];
        return new CoerceoState(board, 0, [0, 0], [0, 0]);
    }
    public constructor(board: Table<FourStatePiece>,
                       turn: number,
                       public readonly tiles: readonly [number, number],
                       public readonly captures: readonly [number, number])
    {
        super(board, turn);
    }
    public applyLegalMovement(move: CoerceoMove): CoerceoState {
        display(CoerceoState.VERBOSE, { coerceoState_applyLegalMovement: { object: this, move } });
        const start: Coord = move.start.get();
        const landing: Coord = move.landingCoord.get();
        const newBoard: FourStatePiece[][] = this.getCopiedBoard();
        newBoard[landing.y][landing.x] = FourStatePiece.ofPlayer(this.getCurrentPlayer());
        newBoard[start.y][start.x] = FourStatePiece.EMPTY;

        return new CoerceoState(newBoard, this.turn, this.tiles, this.captures);
    }
    public doMovementCaptures(move: CoerceoMove): CoerceoState {
        display(CoerceoState.VERBOSE, { coerceoState_doMovementCaptures: { object: this, move } });
        const captureds: Coord[] = this.getCapturedNeighbors(move.landingCoord.get());
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let resultingState: CoerceoState = this;
        for (const captured of captureds) {
            resultingState = resultingState.capture(captured);
        }
        return resultingState;
    }
    public getCapturedNeighbors(coord: Coord): Coord[] {
        const OPPONENT: Player = this.getCurrentOpponent();
        const neighbors: Coord[] = TriangularCheckerBoard.getNeighbors(coord);
        return neighbors.filter((neighbor: Coord) => {
            if (neighbor.isNotInRange(15, 10)) {
                return false;
            }
            if (this.getPieceAt(neighbor).is(OPPONENT)) {
                return this.isSurrounded(neighbor);
            }
            return false;
        });
    }
    public isSurrounded(coord: Coord): boolean {
        const remainingFreedom: Coord[] = this.getEmptyNeighboors(coord, FourStatePiece.EMPTY);
        return remainingFreedom.length === 0;
    }
    public capture(coord: Coord): CoerceoState {
        display(CoerceoState.VERBOSE, { coerceoState_captureIfNeeded: { object: this, coord } });
        const newBoard: FourStatePiece[][] = this.getCopiedBoard();
        const newCaptures: [number, number] = [this.captures[0], this.captures[1]];
        display(CoerceoState.VERBOSE, coord.toString() + ' has been captured');
        newBoard[coord.y][coord.x] = FourStatePiece.EMPTY;
        newCaptures[this.getCurrentPlayer().value] += 1;
        return new CoerceoState(newBoard, this.turn, this.tiles, newCaptures);
    }
    public removeTilesIfNeeded(tile: Coord, countTiles: boolean): CoerceoState {
        display(CoerceoState.VERBOSE,
                { coerceoState_removeTilesIfNeeded: { object: this, tile, countTiles } });
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let resultingState: CoerceoState = this;
        const currentTile: Coord = CoerceoState.getTilesUpperLeftCoord(tile);
        if (this.isTileEmpty(currentTile) &&
            this.isDeconnectable(currentTile))
        {
            resultingState = this.deconnectTile(currentTile, countTiles);
            const neighbors: Coord[] = CoerceoState.getPresentNeighboorEntrances(currentTile);
            for (const neighbor of neighbors) {
                const caseContent: FourStatePiece = resultingState.getPieceAt(neighbor);
                if (caseContent === FourStatePiece.EMPTY) {
                    resultingState = resultingState.removeTilesIfNeeded(neighbor, countTiles);
                } else if (caseContent.is(this.getCurrentOpponent()) &&
                           resultingState.isSurrounded(neighbor))
                {
                    resultingState = resultingState.capture(neighbor);
                }
            }
        }
        return resultingState;
    }
    public isTileEmpty(tileUpperLeft: Coord): boolean {
        assert(this.getPieceAt(tileUpperLeft) !== FourStatePiece.NONE,
               'Should not call isTileEmpty on removed tile');
        for (let y: number = 0; y < 2; y++) {
            for (let x: number = 0; x < 3; x++) {
                const coord: Coord = tileUpperLeft.getNext(new Vector(x, y), 1);
                if (this.getPieceAt(coord) !== FourStatePiece.EMPTY) {
                    return false;
                }
            }
        }
        return true;
    }
    public isDeconnectable(tile: Coord): boolean {
        const neighboorsIndex: number[] = this.getPresentNeighboorTilesRelativeIndexes(tile);
        if (neighboorsIndex.length > 3) {
            return false;
        }
        let holeCount: number = 0;
        for (let i: number = 1; i < neighboorsIndex.length; i++) {
            if (this.areNeighboor(neighboorsIndex[i - 1], neighboorsIndex[i]) === false) {
                holeCount += 1;
            }
        }
        if (this.areNeighboor(neighboorsIndex[0], neighboorsIndex[neighboorsIndex.length - 1]) === false) {
            holeCount += 1;
        }
        return holeCount <= 1;
    }
    private areNeighboor(smallTileIndex: number, bigTileIndex: number): boolean {
        return smallTileIndex + 1 === bigTileIndex ||
               (smallTileIndex === 0 && bigTileIndex === 5);
    }
    public getPresentNeighboorTilesRelativeIndexes(tile: Coord): number[] {
        const neighboorsIndexes: number[] = [];
        let firstIndex: MGPOptional<number> = MGPOptional.empty();
        for (let i: number = 0; i < 6; i++) {
            const vector: Vector = CoerceoState.NEIGHBOORS_TILES_DIRECTIONS[i];
            const neighboorTile: Coord = tile.getNext(vector, 1);
            if (neighboorTile.isInRange(15, 10) &&
                this.getPieceAt(neighboorTile) !== FourStatePiece.NONE)
            {
                if (firstIndex.isAbsent()) {
                    firstIndex = MGPOptional.of(i);
                }
                neighboorsIndexes.push(i - firstIndex.get());
            }
        }
        return neighboorsIndexes;
    }
    public deconnectTile(tileUpperLeft: Coord, countTiles: boolean): CoerceoState {
        display(CoerceoState.VERBOSE,
                { coerceoState_deconnectTile: { object: this, tileUpperLeft, countTiles } });
        const newBoard: FourStatePiece[][] = this.getCopiedBoard();
        const x0: number = tileUpperLeft.x;
        const y0: number = tileUpperLeft.y;
        for (let y: number = 0; y < 2; y++) {
            for (let x: number = 0; x < 3; x++) {
                newBoard[y0 + y][x0 + x] = FourStatePiece.NONE;
            }
        }
        const newTiles: [number, number] = [this.tiles[0], this.tiles[1]];
        if (countTiles) {
            newTiles[this.getCurrentPlayer().value] += 1;
        }
        return new CoerceoState(newBoard,
                                this.turn,
                                newTiles,
                                this.captures);
    }
    public getLegalLandings(coord: Coord): Coord[] {
        const legalLandings: Coord[] = [];
        for (const step of CoerceoStep.STEPS) {
            const landing: Coord = coord.getNext(step.direction, 1);
            if (this.isOnBoard(landing) && this.getPieceAt(landing) === FourStatePiece.EMPTY) {
                legalLandings.push(landing);
            }
        }
        return legalLandings;
    }
    public getPiecesByFreedom(): number[][] {
        const playersScores: number[][] = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 15; x++) {
                const piece: FourStatePiece = this.board[y][x];
                if (piece.isPlayer()) {
                    const nbFreedom: number =
                        this.getEmptyNeighboors(new Coord(x, y), FourStatePiece.EMPTY).length;
                    const oldValue: number = playersScores[piece.value][nbFreedom];
                    playersScores[piece.value][nbFreedom] = oldValue + 1;
                }
            }
        }
        return playersScores;
    }
}
