import { Coord } from 'src/app/jscaip/coord/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { Player } from 'src/app/jscaip/player/Player';
import { ArrayUtils, NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPBiMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { SixFailure } from './SixFailure';
import { SixMove } from './SixMove';

export class SixGameState extends GamePartSlice {

    public readonly width: number;

    public readonly height: number;

    public readonly offset: Vector;

    public static getInitialSlice(): SixGameState {
        const board: NumberTable = [[Player.ZERO.value], [Player.ONE.value]];
        return SixGameState.fromRepresentation(board, 0);
    }
    public static fromRepresentation(board: NumberTable, turn: number, offset?: Vector): SixGameState {
        const pieces: MGPBiMap<Coord, Player> = new MGPBiMap<Coord, Player>();
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (board[y][x] !== Player.NONE.value) {
                    pieces.set(new Coord(x, y), Player.of(board[y][x]));
                }
            }
        }
        return new SixGameState(pieces, turn, offset);
    }
    public static deplacePiece(state: SixGameState, move: SixMove): MGPBiMap<Coord, Player> {
        const pieces: MGPBiMap<Coord, Player> = state.pieces.getCopy();
        pieces.delete(move.start.get());
        pieces.set(move.landing, state.getCurrentPlayer());
        return pieces;
    }
    public static getGroups(pieces: MGPBiMap<Coord, Player>, lastRemovedPiece: Coord): MGPSet<MGPSet<Coord>> {
        let coordsGroup: MGPBiMap<Coord, string> = new MGPBiMap<Coord, string>();
        let nbGroup: number = 0;
        for (const dir of HexaDirection.factory.all) {
            const groupEntry: Coord = lastRemovedPiece.getNext(dir, 1);
            coordsGroup = SixGameState.putCoordInGroup(pieces, groupEntry, coordsGroup, '' + nbGroup);
            nbGroup++;
        }
        const reversed: MGPBiMap<string, MGPSet<Coord>> = coordsGroup.groupByValue();
        const groups: MGPSet<MGPSet<Coord>> = new MGPSet();
        for (let i: number = 0; i < reversed.size(); i++) {
            groups.add(reversed.getByIndex(i).value);
        }
        return groups;
    }
    private static putCoordInGroup(pieces: MGPBiMap<Coord, Player>,
                                   piece: Coord,
                                   coordsGroup: MGPBiMap<Coord, string>,
                                   group: string)
                                   : MGPBiMap<Coord, string>
    {
        if (pieces.get(piece).isPresent() &&
           coordsGroup.get(piece).isAbsent())
        {
            coordsGroup.set(piece, group);
            for (const dir of HexaDirection.factory.all) {
                const nextCoord: Coord = piece.getNext(dir, 1);
                coordsGroup = SixGameState.putCoordInGroup(pieces, nextCoord, coordsGroup, group);
            }
        }
        return coordsGroup;
    }
    public constructor(
        public readonly pieces: MGPBiMap<Coord, Player>,
        turn: number,
        offset?: Vector)
    {
        super([], turn);
        const scale: { width: number,
                       height: number,
                       pieces: MGPBiMap<Coord, Player>,
                       offset: Vector } = this.getCalculatedScale();
        this.pieces = scale.pieces;
        this.width = scale.width;
        this.height = scale.height;
        this.offset = offset || scale.offset;
        this.pieces.makeImmutable();
    }
    public getCalculatedScale(): { width: number,
                                   height: number,
                                   pieces: MGPBiMap<Coord, Player>,
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
        let newPieces: MGPBiMap<Coord, Player> = new MGPBiMap<Coord, Player>();
        const offset: Vector = new Vector(- minWidth, - minHeight);
        if (minWidth !== 0 || minHeight !== 0) {
            for (const coord of this.pieces.listKeys()) {
                const oldValue: Player = this.pieces.delete(coord);
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
    public isIllegalLandingZone(landing: Coord, start: Coord | null): MGPValidation {
        if (this.pieces.containsKey(landing)) {
            return MGPValidation.failure('Cannot land on occupied coord!');
        }
        if (this.isCoordConnected(landing, start)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(SixFailure.MUST_DROP_NEXT_TO_OTHER_PIECE);
        }
    }
    public isCoordConnected(coord: Coord, except: Coord | null): boolean {
        for (const dir of HexaDirection.factory.all) {
            const neighboor: Coord = coord.getNext(dir, 1);
            if (this.pieces.containsKey(neighboor) &&
                neighboor.equals(except) === false)
            {
                return true;
            }
        }
        return false;
    }
    public getPieceAt(coord: Coord): Player {
        if (this.pieces.containsKey(coord)) {
            return this.pieces.get(coord).get();
        } else {
            return Player.NONE;
        }
    }
    public applyLegalDrop(coord: Coord): SixGameState {
        const pieces: MGPBiMap<Coord, Player> = this.pieces.getCopy();
        pieces.put(coord, this.getCurrentPlayer());
        return new SixGameState(pieces, this.turn + 1);
    }
    public applyLegalDeplacement(move: SixMove, kept: MGPSet<Coord>): SixGameState {
        const afterDeplacementPieces: MGPBiMap<Coord, Player> = SixGameState.deplacePiece(this, move);
        let newPieces: MGPBiMap<Coord, Player> = new MGPBiMap<Coord, Player>();
        if (kept.size() > 0) {
            newPieces = new MGPBiMap<Coord, Player>();
            for (let i: number = 0; i < kept.size(); i++) {
                const coord: Coord = kept.get(i);
                newPieces.set(coord, afterDeplacementPieces.get(coord).get());
            }
        } else {
            newPieces = afterDeplacementPieces.getCopy();
        }
        return new SixGameState(newPieces, this.turn + 1);
    }
    public countPieces(): [number, number] {
        const pieces: MGPBiMap<Player, MGPSet<Coord>> = this.pieces.groupByValue();
        const zeroPieces: MGPSet<Coord> = pieces.get(Player.ZERO).getOrNull();
        const onePieces: MGPSet<Coord> = pieces.get(Player.ONE).getOrNull();
        return [
            zeroPieces ? zeroPieces.size() : 0,
            onePieces ? onePieces.size() : 0,
        ];
    }
}
