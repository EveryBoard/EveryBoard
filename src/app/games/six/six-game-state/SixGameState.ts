import { Coord } from 'src/app/jscaip/coord/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { Player } from 'src/app/jscaip/player/Player';
import { ArrayUtils, NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { assert } from 'src/app/utils/collection-lib/utils';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

export class SixGameState extends GamePartSlice {

    public readonly width: number;

    public readonly height: number;

    public static getInitialSlice(): SixGameState {
        const board: NumberTable = [[Player.ZERO.value, Player.ONE.value]];
        return SixGameState.fromRepresentation(board, 0);
    }
    public static fromRepresentation(board: NumberTable, turn: number): SixGameState {
        const pieces: MGPMap<Coord, boolean> = new MGPMap<Coord, boolean>();
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (board[y][x] === Player.ZERO.value) {
                    pieces.set(new Coord(x, y), false);
                }
                if (board[y][x] === Player.ONE.value) {
                    pieces.set(new Coord(x, y), true);
                }
            }
        }
        return new SixGameState(pieces, turn);
    }
    public constructor(
        public readonly pieces: MGPMap<Coord, boolean>,
        turn: number)
    {
        super([], turn);
        const scale: { width: number, height: number } = this.getCalculatedScale();
        this.width = scale.width;
        this.height = scale.height;
    }
    public getCalculatedScale(): { width: number, height: number } {
        let minWidth: number = 0;
        let maxWidth: number = 0;
        let minHeight: number = 0;
        let maxHeight: number = 0;
        for (const coord of this.pieces.listKeys()) {
            minWidth = Math.min(coord.x, minWidth);
            maxWidth = Math.max(coord.x, maxWidth);
            minHeight = Math.min(coord.y, minHeight);
            maxHeight = Math.max(coord.y, maxHeight);
        }
        assert(minWidth === 0, 'should have 0 as minimal X!');
        assert(minHeight === 0, 'should have 0 as minimal Y!');
        return { width: maxWidth + 1, height: maxHeight + 1};
    }
    public toRepresentation(): NumberTable {
        const board: number[][] = ArrayUtils.createBiArray(this.width, this.height, Player.NONE.value);
        for (const piece of this.pieces.listKeys()) {
            const pieceValue: number = this.getPieceAt(piece).value;
            board[piece.y][piece.x] = pieceValue;
        }
        return board;
    }
    public isIllegalLandingZone(coord: Coord): MGPValidation {
        if (this.pieces.containsKey(coord)) {
            return MGPValidation.failure('Cannot land on occupied coord!');
        }
        if (this.isCoordConnected(coord)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Piece must be connected to other pieces!');
        }
    }
    public isCoordConnected(coord: Coord): boolean {
        for (const piece of this.pieces.listKeys()) {
            if (this.areHexaCoordNeighboor(piece, coord)) {
                return true;
            }
        }
        return false;
    }
    public areHexaCoordNeighboor(a: Coord, b: Coord): boolean {
        const vector: Vector = a.getVectorToward(b);
        function vectorIsHexaDirection(hexaDirection: HexaDirection) {
            return Vector.equals(vector, hexaDirection);
        }
        if (HexaDirection.factory.all.some(vectorIsHexaDirection)) {
            return true;
        }
    }
    public getPieceAt(coord: Coord): Player {
        if (this.pieces.containsKey(coord)) {
            return this.pieces.get(coord).getOrNull() ? Player.ONE : Player.ZERO;
        } else {
            return Player.NONE;
        }
    }
}
