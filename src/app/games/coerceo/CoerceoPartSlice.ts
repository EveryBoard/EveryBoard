import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { TriangularGameState } from 'src/app/jscaip/TriangularGameState';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { NumberTable, Table } from 'src/app/utils/ArrayUtils';
import { assert, display } from 'src/app/utils/utils';
import { CoerceoMove, CoerceoStep } from './CoerceoMove';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

export class CoerceoPartSlice extends TriangularGameState {

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
        ].filter(CoerceoPartSlice.isInRange);
    }
    public static getInitialSlice(): CoerceoPartSlice {
        const _: number = FourStatePiece.EMPTY.value;
        const N: number = FourStatePiece.NONE.value;
        const O: number = FourStatePiece.ZERO.value;
        const X: number = FourStatePiece.ONE.value;
        const board: NumberTable = [
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
        return new CoerceoPartSlice(board, 0, [0, 0], [0, 0]);
    }
    public constructor(board: Table<number>,
                       turn: number,
                       public readonly tiles: { readonly 0: number, readonly 1: number},
                       public readonly captures: { readonly 0: number, readonly 1: number})
    {
        super(board, turn);
    }
    public applyLegalDeplacement(move: CoerceoMove): CoerceoPartSlice {
        display(CoerceoPartSlice.VERBOSE, { coerceoPartSlice_applyLegalDeplacement: { object: this, move } });
        const start: Coord = move.start.get();
        const landing: Coord = move.landingCoord.get();
        const newBoard: number[][] = this.getCopiedBoard();
        newBoard[landing.y][landing.x] = FourStatePiece.ofPlayer(this.getCurrentPlayer()).value;
        newBoard[start.y][start.x] = FourStatePiece.EMPTY.value;

        return new CoerceoPartSlice(newBoard, this.turn, this.tiles, this.captures);
    }
    public doDeplacementCaptures(move: CoerceoMove): CoerceoPartSlice {
        display(CoerceoPartSlice.VERBOSE, { coerceoPartSlice_doDeplacementCaptures: { object: this, move } });
        const captureds: Coord[] = this.getCapturedNeighbors(move.landingCoord.get());
        let resultingSlice: CoerceoPartSlice = this;
        for (const captured of captureds) {
            resultingSlice = resultingSlice.capture(captured);
        }
        return resultingSlice;
    }
    public getCapturedNeighbors(coord: Coord): Coord[] {
        const ENEMY: number = this.getCurrentEnnemy().value;
        const neighbors: Coord[] = TriangularCheckerBoard.getNeighboors(coord);
        return neighbors.filter((neighbor: Coord) => {
            if (neighbor.isNotInRange(15, 10)) {
                return false;
            }
            if (this.getBoardAt(neighbor) === ENEMY) {
                return this.isSurrounded(neighbor);
            }
            return false;
        });
    }
    public isSurrounded(coord: Coord): boolean {
        const newBoard: number[][] = this.getCopiedBoard();
        const remainingFreedom: Coord[] =
            TriangularGameState.getEmptyNeighboors(newBoard, coord, FourStatePiece.EMPTY.value);
        return remainingFreedom.length === 0;
    }
    public capture(coord: Coord): CoerceoPartSlice {
        display(CoerceoPartSlice.VERBOSE, { coerceoPartSlice_captureIfNeeded: { object: this, coord } });
        const newBoard: number[][] = this.getCopiedBoard();
        const newCaptures: [number, number] = [this.captures[0], this.captures[1]];
        display(CoerceoPartSlice.VERBOSE, coord.toString() + ' has been captured');
        newBoard[coord.y][coord.x] = FourStatePiece.EMPTY.value;
        newCaptures[this.getCurrentPlayer().value] += 1;
        return new CoerceoPartSlice(newBoard, this.turn, this.tiles, newCaptures);
    }
    public removeTilesIfNeeded(tile: Coord, countTiles: boolean): CoerceoPartSlice {
        display(CoerceoPartSlice.VERBOSE,
                { coerceoPartSlice_removeTilesIfNeeded: { object: this, tile, countTiles } });
        let resultingSlice: CoerceoPartSlice = this;
        const currentTile: Coord = CoerceoPartSlice.getTilesUpperLeftCoord(tile);
        if (this.isTileEmpty(currentTile) &&
            this.isDeconnectable(currentTile))
        {
            resultingSlice = this.deconnectTile(currentTile, countTiles);
            const neighbors: Coord[] = CoerceoPartSlice.getPresentNeighboorEntrances(currentTile);
            for (const neighbor of neighbors) {
                const caseContent: number = resultingSlice.getBoardAt(neighbor);
                if (caseContent === FourStatePiece.EMPTY.value) {
                    resultingSlice = resultingSlice.removeTilesIfNeeded(neighbor, countTiles);
                } else if (caseContent === this.getCurrentEnnemy().value &&
                           resultingSlice.isSurrounded(neighbor))
                {
                    resultingSlice = resultingSlice.capture(neighbor);
                }
            }
        }
        return resultingSlice;
    }
    public isTileEmpty(tileUpperLeft: Coord): boolean {
        assert(this.getBoardAt(tileUpperLeft) !== FourStatePiece.NONE.value,
               'Should not call isTileEmpty on removed tile');
        for (let y: number = 0; y < 2; y++) {
            for (let x: number = 0; x < 3; x++) {
                const coord: Coord = tileUpperLeft.getNext(new Vector(x, y), 1);
                if (this.getBoardAt(coord) !== FourStatePiece.EMPTY.value) {
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
        let firstIndex: number;
        for (let i: number = 0; i < 6; i++) {
            const vector: Vector = CoerceoPartSlice.NEIGHBOORS_TILES_DIRECTIONS[i];
            const neighboorTile: Coord = tile.getNext(vector, 1);
            if (neighboorTile.isInRange(15, 10) &&
                this.getBoardAt(neighboorTile) !== FourStatePiece.NONE.value)
            {
                if (firstIndex == null) {
                    firstIndex = i;
                }
                neighboorsIndexes.push(i - firstIndex);
            }
        }
        return neighboorsIndexes;
    }
    public deconnectTile(tileUpperLeft: Coord, countTiles: boolean): CoerceoPartSlice {
        display(CoerceoPartSlice.VERBOSE,
                { coerceoPartSlice_deconnectTile: { object: this, tileUpperLeft, countTiles } });
        const newBoard: number[][] = this.getCopiedBoard();
        const x0: number = tileUpperLeft.x;
        const y0: number = tileUpperLeft.y;
        for (let y: number = 0; y < 2; y++) {
            for (let x: number = 0; x < 3; x++) {
                newBoard[y0 + y][x0 + x] = FourStatePiece.NONE.value;
            }
        }
        const newTiles: [number, number] = [this.tiles[0], this.tiles[1]];
        if (countTiles) {
            newTiles[this.getCurrentPlayer().value] += 1;
        }
        return new CoerceoPartSlice(newBoard,
                                    this.turn,
                                    newTiles,
                                    this.captures);
    }
    public getLegalLandings(coord: Coord): Coord[] {
        const legalLandings: Coord[] = [];
        for (const step of CoerceoStep.STEPS) {
            const landing: Coord = coord.getNext(step.direction, 1);
            if (landing.isInRange(15, 10) && this.getBoardAt(landing) === FourStatePiece.EMPTY.value) {
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
                if (this.board[y][x] !== FourStatePiece.EMPTY.value &&
                    this.board[y][x] !== FourStatePiece.NONE.value)
                {
                    const nbFreedom: number = TriangularGameState.getEmptyNeighboors(this.board,
                                                                                     new Coord(x, y),
                                                                                     FourStatePiece.EMPTY.value).length;
                    const oldValue: number = playersScores[this.board[y][x]][nbFreedom];
                    playersScores[this.board[y][x]][nbFreedom] = oldValue + 1;
                }
            }
        }
        return playersScores;
    }
}
