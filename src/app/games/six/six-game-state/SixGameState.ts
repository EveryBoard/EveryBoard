import { Coord } from 'src/app/jscaip/coord/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { Player } from 'src/app/jscaip/player/Player';
import { ArrayUtils, NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPBiMap, MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { MGPStr } from 'src/app/utils/mgp-str/MGPStr';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { SixMove } from '../six-move/SixMove';

export class SixGameState extends GamePartSlice {

    public readonly width: number;

    public readonly height: number;

    public static getInitialSlice(): SixGameState {
        const board: NumberTable = [[Player.ZERO.value], [Player.ONE.value]];
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
        const scale: { width: number, height: number, pieces: MGPMap<Coord, boolean> } = this.getCalculatedScale();
        this.pieces = scale.pieces;
        this.width = scale.width;
        this.height = scale.height;
        this.pieces.makeImmutable();
    }
    public getCalculatedScale(): { width: number, height: number, pieces: MGPMap<Coord, boolean> } {
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
        let newPieces: MGPMap<Coord, boolean> = new MGPMap<Coord, boolean>();
        if (minWidth !== 0 || minHeight !== 0) {
            const decallage: Vector = new Vector(- minWidth, - minHeight);
            for (const coord of this.pieces.listKeys()) {
                const oldValue: boolean = this.pieces.delete(coord);
                const newCoord: Coord = coord.getNext(decallage);
                newPieces.set(newCoord, oldValue);
            }
        } else {
            newPieces = this.pieces;
        }
        return {
            width: maxWidth + 1 - minWidth,
            height: maxHeight + 1 - minHeight,
            pieces: newPieces,
        };
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
    public deplacePiece(move: SixMove): SixGameState {
        const pieces: MGPMap<Coord, boolean> = this.pieces.getCopy();
        pieces.delete(move.start.get());
        pieces.set(move.landing, this.getCurrentPlayer() === Player.ONE);
        return new SixGameState(pieces, this.turn);
    }
    public getGroups(lastRemovedPiece: Coord): MGPSet<MGPSet<Coord>> {
        let coordsGroup: MGPBiMap<Coord, MGPStr> = new MGPBiMap<Coord, MGPStr>();
        let nbGroup: number = 0;
        for (const dir of HexaDirection.factory.all) {
            const groupEntry: Coord = lastRemovedPiece.getNext(dir, 1);
            coordsGroup = this.putCoordInGroup(groupEntry, coordsGroup, new MGPStr('' + nbGroup));
            nbGroup++;
        }
        const reversed: MGPBiMap<MGPStr, MGPSet<Coord>> = coordsGroup.groupByValue();
        const groups: MGPSet<MGPSet<Coord>> = new MGPSet();
        for (let i: number = 0; i < reversed.size(); i++) {
            groups.add(reversed.getByIndex(i).value);
        }
        return groups;
    }
    private putCoordInGroup(piece: Coord,
                            coordsGroup: MGPBiMap<Coord, MGPStr>,
                            group: MGPStr): MGPBiMap<Coord, MGPStr>
    {
        if (this.pieces.get(piece).isPresent() &&
            coordsGroup.get(piece).isAbsent())
        {
            coordsGroup.set(piece, group);
            for (const dir of HexaDirection.factory.all) {
                const nextCoord: Coord = piece.getNext(dir, 1);
                coordsGroup = this.putCoordInGroup(nextCoord, coordsGroup, group);
            }
        }
        return coordsGroup;
    }
    public applyLegalDrop(coord: Coord): SixGameState {
        const pieces: MGPMap<Coord, boolean> = this.pieces.getCopy();
        pieces.put(coord, this.getCurrentPlayer() === Player.ONE);
        return new SixGameState(pieces, this.turn + 1);
    }
    public applyLegalDeplacement(move: SixMove, kept: MGPSet<Coord>): SixGameState {
        const stateAfterDeplacement: SixGameState = this.deplacePiece(move);
        let newPieces: MGPMap<Coord, boolean> = new MGPMap<Coord, boolean>();
        if (kept.size() > 0) {
            newPieces = new MGPMap<Coord, boolean>();
            for (let i: number = 0; i < kept.size(); i++) {
                const coord: Coord = kept.get(i);
                newPieces.set(coord, stateAfterDeplacement.pieces.get(coord).get());
            }
        } else {
            newPieces = stateAfterDeplacement.pieces.getCopy();
        }
        return new SixGameState(newPieces, stateAfterDeplacement.turn + 1);
    }
}
