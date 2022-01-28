import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, NumberTable } from 'src/app/utils/ArrayUtils';
import { ReversibleMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SixFailure } from './SixFailure';
import { SixMove } from './SixMove';
import { GameState } from 'src/app/jscaip/GameState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComparableObject } from 'src/app/utils/Comparable';

export class SixState extends GameState implements ComparableObject {

    public readonly width: number;

    public readonly height: number;

    public readonly offset: Vector;

    public static getInitialState(): SixState {
        const board: NumberTable = [[Player.ZERO.value], [Player.ONE.value]];
        return SixState.fromRepresentation(board, 0);
    }
    public static fromRepresentation(board: NumberTable, turn: number, offset?: Vector): SixState {
        const pieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (board[y][x] !== Player.NONE.value) {
                    pieces.set(new Coord(x, y), Player.of(board[y][x]));
                }
            }
        }
        return new SixState(pieces, turn, offset);
    }
    public static deplacePiece(state: SixState, move: SixMove): ReversibleMap<Coord, Player> {
        const pieces: ReversibleMap<Coord, Player> = state.pieces.getCopy();
        pieces.delete(move.start.get());
        pieces.set(move.landing, state.getCurrentPlayer());
        return pieces;
    }
    public static getGroups(pieces: ReversibleMap<Coord, Player>, lastRemovedPiece: Coord): MGPSet<MGPSet<Coord>> {
        let coordsGroup: ReversibleMap<Coord, string> = new ReversibleMap<Coord, string>();
        let nbGroup: number = 0;
        for (const dir of HexaDirection.factory.all) {
            const groupEntry: Coord = lastRemovedPiece.getNext(dir, 1);
            coordsGroup = SixState.putCoordInGroup(pieces, groupEntry, coordsGroup, '' + nbGroup);
            nbGroup++;
        }
        const reversed: ReversibleMap<string, MGPSet<Coord>> = coordsGroup.reverse();
        const groups: MGPSet<MGPSet<Coord>> = new MGPSet();
        for (let i: number = 0; i < reversed.size(); i++) {
            groups.add(reversed.getByIndex(i).value);
        }
        return groups;
    }
    private static putCoordInGroup(pieces: ReversibleMap<Coord, Player>,
                                   piece: Coord,
                                   coordsGroup: ReversibleMap<Coord, string>,
                                   group: string)
    : ReversibleMap<Coord, string>
    {
        if (pieces.get(piece).isPresent() &&
           coordsGroup.get(piece).isAbsent())
        {
            coordsGroup.set(piece, group);
            for (const dir of HexaDirection.factory.all) {
                const nextCoord: Coord = piece.getNext(dir, 1);
                coordsGroup = SixState.putCoordInGroup(pieces, nextCoord, coordsGroup, group);
            }
        }
        return coordsGroup;
    }
    public constructor(public readonly pieces: ReversibleMap<Coord, Player>,
                       turn: number,
                       offset?: Vector)
    {
        super(turn);
        const scale: { width: number,
                       height: number,
                       pieces: ReversibleMap<Coord, Player>,
                       offset: Vector } = this.getCalculatedScale();
        this.pieces = scale.pieces;
        this.width = scale.width;
        this.height = scale.height;
        this.offset = offset || scale.offset;
        this.pieces.makeImmutable();
    }
    public getCalculatedScale(): { width: number,
                                   height: number,
                                   pieces: ReversibleMap<Coord, Player>,
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
        let newPieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
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
        const board: number[][] = ArrayUtils.createTable(this.width, this.height, Player.NONE.value);
        for (const piece of this.pieces.listKeys()) {
            const pieceValue: number = this.getPieceAt(piece).value;
            board[piece.y][piece.x] = pieceValue;
        }
        return board;
    }
    public isIllegalLandingZone(landing: Coord, start: MGPOptional<Coord>): MGPValidation {
        if (this.pieces.containsKey(landing)) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        if (this.isCoordConnected(landing, start)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(SixFailure.MUST_DROP_NEXT_TO_OTHER_PIECE());
        }
    }
    public isCoordConnected(coord: Coord, except: MGPOptional<Coord>): boolean {
        for (const dir of HexaDirection.factory.all) {
            const neighbor: Coord = coord.getNext(dir, 1);
            if (this.pieces.containsKey(neighbor) &&
                (except.equalsValue(neighbor) === false))
            {
                return true;
            }
        }
        return false;
    }
    public isOnBoard(coord: Coord): boolean {
        return this.pieces.containsKey(coord);
    }
    public getPieceAt(coord: Coord): Player {
        if (this.isOnBoard(coord)) {
            return this.pieces.get(coord).get();
        } else {
            return Player.NONE;
        }
    }
    public applyLegalDrop(coord: Coord): SixState {
        const pieces: ReversibleMap<Coord, Player> = this.pieces.getCopy();
        pieces.put(coord, this.getCurrentPlayer());
        return new SixState(pieces, this.turn + 1);
    }
    public applyLegalDeplacement(move: SixMove, kept: MGPSet<Coord>): SixState {
        const afterDeplacementPieces: ReversibleMap<Coord, Player> = SixState.deplacePiece(this, move);
        let newPieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
        if (kept.size() > 0) {
            newPieces = new ReversibleMap<Coord, Player>();
            for (let i: number = 0; i < kept.size(); i++) {
                const coord: Coord = kept.get(i);
                newPieces.set(coord, afterDeplacementPieces.get(coord).get());
            }
        } else {
            newPieces = afterDeplacementPieces.getCopy();
        }
        return new SixState(newPieces, this.turn + 1);
    }
    public countPieces(): [number, number] {
        const pieces: ReversibleMap<Player, MGPSet<Coord>> = this.pieces.reverse();
        const zeroPieces: MGPSet<Coord> = pieces.get(Player.ZERO).getOrElse(new MGPSet());
        const onePieces: MGPSet<Coord> = pieces.get(Player.ONE).getOrElse(new MGPSet());
        return [zeroPieces.size(), onePieces.size()];
    }
    public switchPiece(coord: Coord): SixState {
        const newPieces: ReversibleMap<Coord, Player> = this.pieces.getCopy();
        const oldValue: Player = this.getPieceAt(coord);
        newPieces.replace(coord, oldValue.getOpponent());
        return new SixState(newPieces, this.turn, this.offset);
    }
    public equals(o: SixState): boolean {
        return this.turn === o.turn && this.pieces.equals(o.pieces);
    }
}
