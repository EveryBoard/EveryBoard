import { Coord } from 'src/app/jscaip/coord/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { Player } from 'src/app/jscaip/player/Player';
import { ArrayUtils, NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Comparable } from 'src/app/utils/collection-lib/Comparable';
import { MGPBiMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { MGPStr } from 'src/app/utils/mgp-str/MGPStr';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { SixMove } from '../six-move/SixMove';

export class MGPBoolean implements Comparable {

    public static TRUE: MGPBoolean = new MGPBoolean(true);

    public static FALSE: MGPBoolean = new MGPBoolean(false);

    private constructor(public readonly value: boolean) {}

    public equals(o: MGPBoolean): boolean {
        return o.value === this.value;
    }
    public toString(): string {
        return '' + this.value;
    }

}
export class SixGameState extends GamePartSlice {

    public readonly width: number;

    public readonly height: number;

    public readonly offset: Vector;

    public static getInitialSlice(): SixGameState {
        const board: NumberTable = [[Player.ZERO.value], [Player.ONE.value]];
        return SixGameState.fromRepresentation(board, 0);
    }
    public static fromRepresentation(board: NumberTable, turn: number): SixGameState {
        const pieces: MGPBiMap<Coord, MGPBoolean> = new MGPBiMap<Coord, MGPBoolean>();
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (board[y][x] === Player.ZERO.value) {
                    pieces.set(new Coord(x, y), MGPBoolean.FALSE);
                }
                if (board[y][x] === Player.ONE.value) {
                    pieces.set(new Coord(x, y), MGPBoolean.TRUE);
                }
            }
        }
        return new SixGameState(pieces, turn);
    }
    public constructor(
        public readonly pieces: MGPBiMap<Coord, MGPBoolean>,
        turn: number)
    {
        super([], turn);
        const scale: { width: number,
                       height: number,
                       pieces: MGPBiMap<Coord, MGPBoolean>,
                       offset: Vector } = this.getCalculatedScale();
        this.pieces = scale.pieces;
        this.width = scale.width;
        this.height = scale.height;
        this.offset = scale.offset;
        this.pieces.makeImmutable();
    }
    public getCalculatedScale(): { width: number,
                                   height: number,
                                   pieces: MGPBiMap<Coord, MGPBoolean>,
                                   offset: Vector }
    {
        let minWidth: number = Number.MAX_SAFE_INTEGER;
        let maxWidth: number = Number.MIN_SAFE_INTEGER;
        let minHeight: number = Number.MAX_SAFE_INTEGER;
        let maxHeight: number = Number.MIN_SAFE_INTEGER;
        for (const coord of this.pieces.listKeys()) {
            minWidth = Math.min(coord.x, minWidth);
            maxWidth = Math.max(coord.x, maxWidth);
            minHeight = Math.min(coord.y, minHeight);
            maxHeight = Math.max(coord.y, maxHeight);
        }
        let newPieces: MGPBiMap<Coord, MGPBoolean> = new MGPBiMap<Coord, MGPBoolean>();
        const offset: Vector = new Vector(- minWidth, - minHeight);
        if (minWidth !== 0 || minHeight !== 0) {
            for (const coord of this.pieces.listKeys()) {
                const oldValue: MGPBoolean = this.pieces.delete(coord);
                const newCoord: Coord = coord.getNext(offset);
                newPieces.set(newCoord, oldValue);
            }
        } else {
            newPieces = this.pieces;
        }
        return {
            width: maxWidth + 1 - minWidth,
            height: maxHeight + 1 - minHeight,
            pieces: newPieces,
            offset,
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
            return this.pieces.get(coord).getOrNull() === MGPBoolean.TRUE ? Player.ONE : Player.ZERO;
            // TODO: get() and not getOrNull
        } else {
            return Player.NONE;
        }
    }
    public deplacePiece(move: SixMove): SixGameState {
        const pieces: MGPBiMap<Coord, MGPBoolean> = this.pieces.getCopy() as MGPBiMap<Coord, MGPBoolean>;
        pieces.delete(move.start.get());
        pieces.set(move.landing, this.getCurrentPlayer() === Player.ONE ? MGPBoolean.TRUE : MGPBoolean.FALSE);
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
        const pieces: MGPBiMap<Coord, MGPBoolean> = this.pieces.getCopy() as MGPBiMap<Coord, MGPBoolean>;
        pieces.put(coord, this.getCurrentPlayer() === Player.ONE ? MGPBoolean.TRUE : MGPBoolean.FALSE);
        return new SixGameState(pieces, this.turn + 1);
    }
    public applyLegalDeplacement(move: SixMove, kept: MGPSet<Coord>): SixGameState {
        const stateAfterDeplacement: SixGameState = this.deplacePiece(move);
        let newPieces: MGPBiMap<Coord, MGPBoolean> = new MGPBiMap<Coord, MGPBoolean>();
        if (kept.size() > 0) {
            newPieces = new MGPBiMap<Coord, MGPBoolean>();
            for (let i: number = 0; i < kept.size(); i++) {
                const coord: Coord = kept.get(i);
                newPieces.set(coord, stateAfterDeplacement.pieces.get(coord).get());
            }
        } else {
            newPieces = stateAfterDeplacement.pieces.getCopy() as MGPBiMap<Coord, MGPBoolean>;
        }
        return new SixGameState(newPieces, stateAfterDeplacement.turn + 1);
    }
    public countPieces(owner: Player): number {
        const player: MGPBoolean = owner === Player.ONE ? MGPBoolean.TRUE : MGPBoolean.FALSE;
        const playerPieces: MGPOptional<MGPSet<Coord>> = this.pieces.groupByValue().get(player);
        if (playerPieces.isAbsent()) {
            return 0;
        } else {
            return playerPieces.get().size();
        }
    }
}
