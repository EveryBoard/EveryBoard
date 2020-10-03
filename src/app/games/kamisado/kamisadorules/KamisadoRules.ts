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
import { SlicePipe } from "@angular/common";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { KamisadoRulesConfig } from "./KamisadoRulesConfig";

abstract class KamisadoNode extends MNode<KamisadoRules, KamisadoMove, KamisadoPartSlice, LegalityStatus> {}

export class KamisadoRules extends Rules<KamisadoMove, KamisadoPartSlice, LegalityStatus> {

    constructor() {
        super(true); // TODO: ALL RULES ARE NOW PEARED
        this.node = MNode.getFirstNode(
            new KamisadoPartSlice(0, KamisadoColor.ANY, false, ArrayUtils.mapBiArray(KamisadoBoard.getInitialBoard(), p => p.getValue())),
            this
        );
    }
    public static getMovablePieces(partSlice: KamisadoPartSlice, player: Player, colorToPlay: KamisadoColor): Array<Coord> {
        const len = partSlice.board.length;
        let coords: Array<Coord> = [];
        for (let y = 0; y < len; y++) {
            for (let x = 0; x < len; x++) {
                const piece = partSlice.getPieceAt(x, y);
                if (piece.player == player && // this is one of the player's pieces
                    (piece.color == colorToPlay || colorToPlay == KamisadoColor.ANY)) { // and its color can be moved
                    coords.push(new Coord(x, y))
                }
            }
        }
        return coords;
    }
    public static playerDirections(player: Player): Array<Direction> {
        if (player === Player.ONE) {
            return [Direction.DOWN, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];
        } else if (player === Player.ZERO) {
            return [Direction.UP, Direction.UP_LEFT, Direction.UP_RIGHT];
        } else {
            return [];
        }
    }
    public getListMoves(node: KamisadoNode): MGPMap<KamisadoMove, KamisadoPartSlice> {
        const slice = node.gamePartSlice;
        const player = slice.getCurrentPlayer();
        const len = slice.board.length;
        const colorToPlay = slice.colorToPlay;
        // Get all the pieces that can play
        let moves = new MGPMap<KamisadoMove, KamisadoPartSlice>();
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
                            if (result.slice === undefined) throw new Error("result.slice is undefined");
                            moves.set(move, result.slice);
                       }
                    }
                }
            }
        }
        console.log("There are " + moves.size() + " moves");
        if (moves.size() === 0 && !slice.alreadyPassed) {
            // No move, player can only pass
            const move: KamisadoMove = KamisadoMove.PASS;
            const result = KamisadoRules.tryMove(slice, move);
            if (result.success) {
                if (result.slice === undefined) throw new Error("result.slice is undefined");
                moves.set(move, result.slice);
            }
        }
        return moves;
    }
    public getBoardValue(move: KamisadoMove, slice: KamisadoPartSlice): number {
        // 1. See who is playing: 0 is first player, 1 is second player
        const player = slice.getCurrentPlayer();
        // 2. See how far my piece is
        // 3. See how far my opponent piece is
        let furthest0 = 7; // player 0 goes from bottom (7) to top (0)
        let furthest1 = 0; // player 1 goes from top (0) to bottom (7)
        const len = slice.board.length;
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
        // 4. Board value is how far my piece is - how far my opponent piece is
        if (furthest1 === 7) {
            return Number.MAX_SAFE_INTEGER;
        } else if (furthest0 === 0) {
            return Number.MIN_SAFE_INTEGER;
        } else {
            return furthest1 - (7 - furthest0);
        }
    }
    public static tryMove(slice: KamisadoPartSlice, move: KamisadoMove)
    : {success: boolean, slice: KamisadoPartSlice} {
        const start: Coord = move.coord;
        const end: Coord = move.end;
        const failure = {success: false, slice: null};
        const colorToPlay = slice.colorToPlay;

        if (move.equals(KamisadoMove.PASS)) {
            return { success: true, slice: new KamisadoPartSlice(slice.turn+1, slice.colorToPlay, true, slice.board)};
        }

        if (!start.isInRange(KamisadoRulesConfig.WIDTH, KamisadoRulesConfig.HEIGHT) || 
            !end.isInRange(KamisadoRulesConfig.WIDTH, KamisadoRulesConfig.HEIGHT)) {
            // This should already have been checked when constructing the move
            throw new Error("KamisadoRules.tryMove: move out of bounds");
        }

        // Check legality
        const piece = slice.getPieceAt(start.x, start.y);
        // Start case should be owned by the player that plays
        if (piece.player !== slice.getCurrentPlayer()) {
            //console.log("starting case not owned by playing player (" + slice.getCurrentPlayer().value + "), but by " + piece.player.value);
            return failure;
        }
        // Start case should contain a piece of the right color (or any color can be played)
        if (colorToPlay !== KamisadoColor.ANY && piece.color !== colorToPlay) {
            //console.log("starting case does not contain a piece of the right color: " + piece.color.name + ", while it should be: " + colorToPlay.name);
            return failure;
        }
        const endPiece = slice.getPieceAt(end.x, end.y);
        // End case should be empty
        if (endPiece.player !== Player.NONE) {
            //console.log("end case is not empty (" + Player.NONE.value + "): it is: " + endPiece.player.value);
            return failure;
        }
        // All steps between start and end should be empty
        const dir = Direction.fromMove(start, end);
        let currentCoord: Coord = start;
        while (!currentCoord.equals(end)) {
            currentCoord = currentCoord.getNext(dir);
            console.log("current coord: " + currentCoord.toString() + " (start: " + start.toString() + ", end: " + end.toString() + ") =? end" + currentCoord.equals(end));
            if (!slice.getPieceAt(currentCoord.x, currentCoord.y).isEmpty())
                return failure;
        }

        console.log("applying the move");
        // Apply the move
        const newBoard = slice.getCopiedBoard();
        newBoard[end.y][end.x] = newBoard[start.y][start.x]; // actual move
        newBoard[start.y][start.x] = KamisadoPiece.NONE.getValue(); // unoccupied
        const newColorToPlay: KamisadoColor = KamisadoBoard.COLORS[end.y][end.x];
        const resultingSlice = new KamisadoPartSlice(slice.turn+1, newColorToPlay, false, newBoard);
        return {success: true, slice: resultingSlice};
    }
    public applyLegalMove(move: KamisadoMove, slice: KamisadoPartSlice, status: LegalityStatus): {resultingMove: KamisadoMove, resultingSlice: KamisadoPartSlice} {
        const board: number[][] = slice.getCopiedBoard();
        const turn: number = slice.turn;
        const colorToPlay: KamisadoColor = slice.colorToPlay;

        const player: Player = slice.getCurrentPlayer();
        console.log("apply legal move");
        const resultingSlice: KamisadoPartSlice = KamisadoRules.tryMove(slice, move).slice;
        return {resultingSlice, resultingMove: move};
    }
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