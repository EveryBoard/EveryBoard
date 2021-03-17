import { Coord } from 'src/app/jscaip/coord/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { NumberTable, Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { assert } from 'src/app/utils/collection-lib/utils';
import { CoerceoMove } from '../coerceo-move/CoerceoMove';

export class CoerceoPiece {

    public static ZERO: CoerceoPiece = new CoerceoPiece(Player.ZERO.value);

    public static ONE: CoerceoPiece = new CoerceoPiece(Player.ONE.value);

    public static EMPTY: CoerceoPiece = new CoerceoPiece(Player.NONE.value);

    public static NONE: CoerceoPiece = new CoerceoPiece(3);

    public static ofPlayer(player: Player): CoerceoPiece {
        switch (player) {
            case Player.ZERO: return CoerceoPiece.ZERO;
            case Player.ONE: return CoerceoPiece.ONE;
            default: throw new Error('CoerceoPiece.ofPlayer can only be called with Player.ZERO and Player.ONE.');
        }
    }
    private constructor(public readonly value: number) {
    }
}

export class CoerceoPartSlice extends GamePartSlice {

    public static readonly NEIGHBOORS_TILES_DIRECTIONS: ReadonlyArray<Vector> = [
        new Vector(+0, -2), // UP
        new Vector(+3, -1), // UP_RIGHT
        new Vector(+3, +1), // DOWN_RIGHT
        new Vector(+0, +2), // DOWN
        new Vector(-3, +1), // DOWN_LEFT
        new Vector(-3, -1), // UP_LEFT
    ];
    public static getInitialSlice(): CoerceoPartSlice {
        const _: number = CoerceoPiece.EMPTY.value;
        const N: number = CoerceoPiece.NONE.value;
        const O: number = CoerceoPiece.ZERO.value;
        const X: number = CoerceoPiece.ONE.value;
        const board: NumberTable = [
            [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
            [N, N, N, _, _, X, _, _, _, X, _, _, N, N, N],
            [_, O, _, O, _, _, X, _, X, _, _, O, _, O, _],
            [O, _, _, _, O, _, _, _, _, _, O, _, _, _, O],
            [_, O, _, O, _, _, _, _, _, _, _, O, _, O, _],
            [_, X, _, X, _, _, _, _, _, _, _, X, _, X, _],
            [X, _, _, _, X, _, _, _, _, _, X, _, _, _, X],
            [_, X, _, X, _, _, O, _, O, _, _, X, _, X, _],
            [N, N, N, _, _, O, _, _, _, O, _, _, N, N, N],
            [N, N, N, N, N, N, O, _, O, N, N, N, N, N, N],
        ];
        return new CoerceoPartSlice(board, 0, { zero: 0, one: 0 }, { zero: 0, one: 0 });
    }
    public constructor(board: Table<number>,
                       turn: number,
                       public readonly tiles: { readonly zero: number, readonly one: number},
                       public readonly captures: { readonly zero: number, readonly one: number})
    {
        super(board, turn);
    }
    public applyLegalDeplacement(move: CoerceoMove): CoerceoPartSlice {
        const start: Coord = move.start.get();
        const landing: Coord = move.landingCoord.get();
        const newBoard: number[][] = this.getCopiedBoard();
        newBoard[landing.y][landing.x] = CoerceoPiece.ofPlayer(this.getCurrentPlayer()).value;
        newBoard[start.y][start.x] = CoerceoPiece.EMPTY.value;

        return new CoerceoPartSlice(newBoard, this.turn, this.tiles, this.captures);
    }
    public getTilesCoord(start: Coord): Coord {
        const x: number = Math.floor(start.x / 3);
        const y: number = Math.floor(start.y / 2);
        return new Coord(x, y);
    }
    public isTilesEmpty(tiles: Coord): boolean {
        console.log( { tilesToCheckEmptyness: tiles })
        const x0: number = tiles.x * 3;
        const y0: number = tiles.y * 2;
        assert(this.getBoardByXY(x0, y0) !== CoerceoPiece.NONE.value, 'Should not call isTilesEmpty on removed tile');
        for (let y: number = 0; y < 2; y++) {
            for (let x: number = 0; x < 3; x++) {
                if (this.getBoardByXY(x0 + x, y0 + y) !== CoerceoPiece.EMPTY.value) {
                    return false;
                }
            }
        }
        return true;
    }
    public isDeconnectable(leftTiles: Coord): boolean {
        const connectedSidesIndexes: number[] = this.getTilesNeighboorIndexes(leftTiles);
        console.log({ mesVoisinsSympas: connectedSidesIndexes })
        if (connectedSidesIndexes.length > 3) {
            return false;
        }
        let i: number = 1;
        while (i < connectedSidesIndexes.length) {
            if (connectedSidesIndexes[i - 1] === connectedSidesIndexes[i] - 1 ||
                (connectedSidesIndexes[0] === 0 && connectedSidesIndexes[i] === 5))
            {
                i++;
            } else {
                return false;
            }
        }
        return true;
    }
    public getTilesNeighboorIndexes(tiles: Coord): number[] {
        const tilesUpperLeft: Coord = new Coord(tiles.x * 3, tiles.y * 2);
        const neighboorsIndexes: number[] = [];
        for (let i: number = 0; i < 6; i++) {
            const vector: Vector = CoerceoPartSlice.NEIGHBOORS_TILES_DIRECTIONS[i];
            const neighboorTile: Coord = tilesUpperLeft.getNext(vector, 1);
            if (neighboorTile.isInRange(15, 10)) {
                if (this.getBoardAt(neighboorTile) !== CoerceoPiece.NONE.value) {
                    neighboorsIndexes.push(i);
                }
            }
        }
        return neighboorsIndexes;
    }
}
