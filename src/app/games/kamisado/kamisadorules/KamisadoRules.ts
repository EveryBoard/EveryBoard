import {Rules} from "../../../jscaip/Rules";
import {Coord} from "../../../jscaip/coord/Coord";
import {MNode} from "../../../jscaip/MNode";
import {LegalityStatus} from "src/app/jscaip/LegalityStatus";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { Direction } from "src/app/jscaip/DIRECTION";
import { Player } from "src/app/jscaip/Player";
import { KamisadoBoard } from "../KamisadoBoard";
import { KamisadoColor } from "../KamisadoColor";
import { KamisadoPiece } from "../KamisadoPiece";
import { KamisadoPartSlice } from "../KamisadoPartSlice";
import { KamisadoMove } from "../kamisadomove/KamisadoMove";
import { KamisadoRulesConfig } from "./KamisadoRulesConfig";
import { SlicePipe } from "@angular/common";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";

abstract class KamisadoNode extends MNode<KamisadoRules, KamisadoMove, KamisadoPartSlice, LegalityStatus> {}

export class KamisadoRules extends Rules<KamisadoMove, KamisadoPartSlice, LegalityStatus> {
    constructor(initialSlice: KamisadoPartSlice) {
        super(true);
        this.node = MNode.getFirstNode(initialSlice, this);
        this
    }

    // Returns the list of pieces that can be moved for a slice
    // This is often only one piece, except in the first turn
    public static getMovablePieces(slice: KamisadoPartSlice, player: Player, colorToPlay: KamisadoColor): Array<Coord> {
        if (slice.colorToPlay !== KamisadoColor.ANY) {
            // Only one piece can move, and its coord is stored in slice.coordToPlay
            return [slice.coordToPlay.get()];
        }
        // Otherwise, this is the first turn and all pieces can move
        // Player 0 starts the game, so we don't have to compute the list of movable pieces
        return [new Coord(0, 7), new Coord(1, 7), new Coord(2, 7), new Coord(3, 7),
                new Coord(4, 7), new Coord(5, 7), new Coord(6, 7), new Coord(7, 7)];
        // To compute it, we could do it like this (but this is not necessary)
        /* const len = slice.board.length;
        let coords: Array<Coord> = [];
        for (let y = 0; y < len; y++) {
            for (let x = 0; x < len; x++) {
                const piece = slice.getPieceAt(x, y);
                if (piece.player === player && // this is one of the player's pieces
                    (piece.color === colorToPlay || colorToPlay === KamisadoColor.ANY)) { // and its color can be moved
                    coords.push(new Coord(x, y))
                }
            }
        }
        return coords;*/
    }
    // Returns the directions allowed for the move of a player
    public static playerDirections(player: Player): Array<Direction> {
        if (player === Player.ONE) {
            return [Direction.DOWN, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];
        } else if (player === Player.ZERO) {
            return [Direction.UP, Direction.UP_LEFT, Direction.UP_RIGHT];
        } else {
            return [];
        }
    }
    // Check if a direction is allowed for a given player
    public static directionAllowedForPlayer(dir: Direction, player: Player): boolean {
        if (player === Player.ZERO) {
            return dir.y < 0;
        } else if (player === Player.ONE) {
            return dir.y > 0;
        } else {
            throw new Error("Invalid player");
        }
    }
    // Returns the list of moves of a player
    public getListMovesFromSlice(slice: KamisadoPartSlice): MGPMap<KamisadoMove, KamisadoPartSlice> {
        const player: Player = slice.getCurrentPlayer();
        const len: number = slice.board.length;
        const colorToPlay: KamisadoColor= slice.colorToPlay;
        // Get all the pieces that can play
        let moves: MGPMap<KamisadoMove, KamisadoPartSlice> = new MGPMap<KamisadoMove, KamisadoPartSlice>();
        for (const startCoord of KamisadoRules.getMovablePieces(slice, player, colorToPlay)) {
            // For each piece, look at all positions where it can go
            for (let i = 1; i < len; i++) {
                // For each direction, create a move of i in that direction
                for (const dir of KamisadoRules.playerDirections(player)) {
                    let endCoord = startCoord;
                    for (let j = 0; j < i; j++) {
                        endCoord = endCoord.getNext(dir);
                        if (!endCoord.isInRange(len, len) || !slice.isEmptyAt(endCoord.x, endCoord.y)) {
                            // Way is obstructed, don't continue
                            break;
                        }
                    }
                    if (endCoord.isInRange(len, len) && slice.isEmptyAt(endCoord.x, endCoord.y)) {
                        // Check if the move can be done, and if so, add the resulting slice to the map to be returned
                        const move = new KamisadoMove(startCoord, endCoord);
                        const result = KamisadoRules.tryMove(slice, move);
                        if (result.success) {
                            moves.set(move, result.slice);
                       }
                    }
                }
            }
        }
        if (moves.size() === 0 && !slice.alreadyPassed) {
            // No move, player can only pass
            const move: KamisadoMove = KamisadoMove.PASS;
            const result = KamisadoRules.tryMove(slice, move);
            if (result.success) {
                moves.set(move, result.slice);
            }
        }
        return moves;
    }

    public getListMoves(node: KamisadoNode): MGPMap<KamisadoMove, KamisadoPartSlice> {
        return this.getListMovesFromSlice(node.gamePartSlice);
    }
    // Check if the only possible move is to pass
    // This calls getListMoves, so it may be expensive
    public canOnlyPass(slice: KamisadoPartSlice): boolean {
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = this.getListMovesFromSlice(slice);
        return moves.size() === 1 && moves.listKeys()[0] === KamisadoMove.PASS;
    }
    // Returns the value of the board, as the difference of distance to the win
    public getBoardValue(move: KamisadoMove, slice: KamisadoPartSlice): number {
        const player: Player = slice.getCurrentPlayer();
        if (this.canOnlyPass(slice) && slice.alreadyPassed) {
            return player === Player.ZERO ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
        }
        let furthest0: number = 7; // player 0 goes from bottom (7) to top (0)
        let furthest1: number = 0; // player 1 goes from top (0) to bottom (7)
        const len: number = slice.board.length;
        for (let y = 0; y < len; y++) {
            for (let x = 0; x < len; x++) {
                const piece = slice.getPieceAt(x, y);
                if (!piece.equals(KamisadoPiece.NONE)) {
                    if (piece.player === Player.ONE) { // player 1, top (0) to bottom (7) so we want the max
                        furthest1 = Math.max(furthest1, y);
                    } else if (piece.player === Player.ZERO) { // player 0, bottom (7) to top (0), so we want the min
                        furthest0 = Math.min(furthest0, y);
                    }
                }
            }
        }
        // Board value is how far my piece is - how far my opponent piece is
        if (furthest1 === 7) {
            return Number.MAX_SAFE_INTEGER;
        } else if (furthest0 === 0) {
            return Number.MIN_SAFE_INTEGER;
        } else {
            return furthest1 - (7 - furthest0);
        }
    }
    // Returns the next coord that plays
    public static nextCoordToPlay(slice: KamisadoPartSlice, colorToPlay: KamisadoColor) : MGPOptional<Coord> {
        for (let y = 0; y < slice.board.length; y++) {
            for (let x = 0; x < slice.board.length; x++) {
                const piece = slice.getPieceAt(x, y);
                if (piece.player === slice.getCurrentPlayer() && piece.color.equals(colorToPlay)) {
                    return MGPOptional.of(new Coord(x, y));
                }
            }
        }
        return MGPOptional.empty();
    }
    // Perform the move if possible
    public static tryMove(slice: KamisadoPartSlice, move: KamisadoMove)
    : {success: boolean, slice: KamisadoPartSlice} {
        const start: Coord = move.coord;
        const end: Coord = move.end;
        const failure = {success: false, slice: null};
        const colorToPlay: KamisadoColor = slice.colorToPlay;

        if (move.equals(KamisadoMove.PASS)) {
            let nextCoord: MGPOptional<Coord> = this.nextCoordToPlay(slice, slice.colorToPlay);
            return { success: true, slice: new KamisadoPartSlice(slice.turn+1, slice.colorToPlay, nextCoord, true, slice.board)};
        }

        if (!start.isInRange(KamisadoRulesConfig.WIDTH, KamisadoRulesConfig.HEIGHT) || 
            !end.isInRange(KamisadoRulesConfig.WIDTH, KamisadoRulesConfig.HEIGHT)) {
            // This should already have been checked when constructing the move
            throw new Error("KamisadoRules.tryMove: move out of bounds");
        }

        // Check legality
        const piece: KamisadoPiece = slice.getPieceAt(start.x, start.y);
        // Start case should be owned by the player that plays
        if (piece.belongsTo(slice.getCurrentPlayer())) {
            return failure;
        }
        // Start case should contain a piece of the right color (or any color can be played)
        if (colorToPlay !== KamisadoColor.ANY && piece.color !== colorToPlay) {
            return failure;
        }
        const endPiece: KamisadoPiece = slice.getPieceAt(end.x, end.y);
        // End case should be empty
        if (endPiece.isEmpty()) {
            return failure;
        }
        // All steps between start and end should be empty
        try {
            const dir:Direction = Direction.fromMove(start, end);
            if (!KamisadoRules.directionAllowedForPlayer(dir, slice.getCurrentPlayer())) {
                return failure;
            }
            let currentCoord: Coord = start;
            while (!currentCoord.equals(end)) {
                currentCoord = currentCoord.getNext(dir);
                if (!slice.getPieceAt(currentCoord.x, currentCoord.y).isEmpty())
                    return failure;
            }
        } catch (e) {
            return failure;
        }

        // Apply the move
        const newBoard: number[][] = slice.getCopiedBoard();
        newBoard[end.y][end.x] = newBoard[start.y][start.x]; // actual move
        newBoard[start.y][start.x] = KamisadoPiece.NONE.getValue(); // unoccupied
        const newColorToPlay: KamisadoColor = KamisadoBoard.COLORS[end.y][end.x];

        // Get the next piece that can move
        let nextCoord: MGPOptional<Coord> = this.nextCoordToPlay(slice, newColorToPlay);

        // Construct the next slice
        const resultingSlice = new KamisadoPartSlice(slice.turn+1, newColorToPlay, nextCoord, false, newBoard);
        return {success: true, slice: resultingSlice};
    }
    // Apply the move by only relying on tryMove
    public applyLegalMove(move: KamisadoMove, slice: KamisadoPartSlice, status: LegalityStatus): {resultingMove: KamisadoMove, resultingSlice: KamisadoPartSlice} {
        const resultingSlice: KamisadoPartSlice = KamisadoRules.tryMove(slice, move).slice;
        return {resultingSlice, resultingMove: move};
    }
    // Check the legality on the move by applying it with tryMove
    public isLegal(move: KamisadoMove, slice: KamisadoPartSlice): LegalityStatus {
        return { legal: KamisadoRules.tryMove(slice, move).success }
    }
    public setInitialBoard(): void {
        if (this.node == null) {
            this.node = MNode.getFirstNode(KamisadoPartSlice.getStartingSlice(), this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
}