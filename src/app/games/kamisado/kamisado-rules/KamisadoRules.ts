import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { KamisadoBoard } from '../KamisadoBoard';
import { KamisadoColor } from '../KamisadoColor';
import { KamisadoMove } from '../kamisado-move/KamisadoMove';
import { KamisadoPartSlice } from '../KamisadoPartSlice';
import { KamisadoPiece } from '../KamisadoPiece';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Player } from 'src/app/jscaip/player/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

abstract class KamisadoNode extends MGPNode<KamisadoRules, KamisadoMove, KamisadoPartSlice, LegalityStatus> { }

export class KamisadoRules extends Rules<KamisadoMove, KamisadoPartSlice, LegalityStatus> {
    public getColorMatchingPiece(slice: KamisadoPartSlice): Array<Coord> {
        if (slice.colorToPlay !== KamisadoColor.ANY) {
            // Only one piece can move, and its coord is stored in slice.coordToPlay
            return [slice.coordToPlay.get()];
        }
        // Otherwise, this is the first turn and all pieces can move
        // Player 0 starts the game, so we don't have to compute the list of movable pieces
        return [new Coord(0, 7), new Coord(1, 7), new Coord(2, 7), new Coord(3, 7),
            new Coord(4, 7), new Coord(5, 7), new Coord(6, 7), new Coord(7, 7)];
    }
    public getMovablePieces(slice: KamisadoPartSlice): Array<Coord> {
        return this.getColorMatchingPiece(slice)
            .filter((startCoord: Coord): boolean => {
                // For each direction, create a move of 1 in that direction
                for (const dir of this.playerDirections(slice.getCurrentPlayer())) {
                    const endCoord = startCoord.getNext(dir);
                    if (KamisadoBoard.isOnBoard(endCoord) && KamisadoBoard.isEmptyAt(slice.board, endCoord)) {
                        // Move is valid, check legality
                        const move = KamisadoMove.of(startCoord, endCoord);
                        if (this.isLegal(move, slice)) {
                            // Move is legal
                            return true;
                        }
                    }
                }
                return false;
            });
    }
    // Returns the directions allowed for the move of a player
    public playerDirections(player: Player): Array<Direction> {
        if (player === Player.ONE) {
            return [Direction.DOWN, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];
        } else if (player === Player.ZERO) {
            return [Direction.UP, Direction.UP_LEFT, Direction.UP_RIGHT];
        } else {
            throw new Error('Invalid player');
        }
    }
    // Check if a direction is allowed for a given player
    public directionAllowedForPlayer(dir: Direction, player: Player): boolean {
        if (player === Player.ZERO) {
            return dir.y < 0;
        } else if (player === Player.ONE) {
            return dir.y > 0;
        } else {
            throw new Error('Invalid player');
        }
    }
    // Returns the list of moves of a player
    public getListMovesFromSlice(slice: KamisadoPartSlice): MGPMap<KamisadoMove, KamisadoPartSlice> {
        const movablePieces: Coord[] = this.getMovablePieces(slice);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = new MGPMap<KamisadoMove, KamisadoPartSlice>();
        if (movablePieces.length === 0) {
            // No move, player can only pass
            if (!slice.alreadyPassed) {
                const move: KamisadoMove = KamisadoMove.PASS;
                const legality = this.isLegal(move, slice);
                if (legality.legal.isSuccess()) {
                    const result = this.applyLegalMove(move, slice, legality);
                    moves.set(result.resultingMove, result.resultingSlice);
                }
            }
        } else {
            // There are moves, compute them
            const player: Player = slice.getCurrentPlayer();
            // Get all the pieces that can play
            for (const startCoord of movablePieces) {
                // For each piece, look at all positions where it can go
                for (let i = 1; i < KamisadoBoard.SIZE; i++) {
                    // For each direction, create a move of i in that direction
                    for (const dir of this.playerDirections(player)) {
                        let endCoord = startCoord;
                        for (let j = 0; j < i; j++) {
                            endCoord = endCoord.getNext(dir);
                            if (!KamisadoBoard.isOnBoard(endCoord) || !KamisadoBoard.isEmptyAt(slice.board, endCoord)) {
                                // Way is obstructed, don't continue
                                break;
                            }
                        }
                        if (KamisadoBoard.isOnBoard(endCoord) && KamisadoBoard.isEmptyAt(slice.board, endCoord)) {
                            // Check if the move can be done, and if so, add the resulting slice to the map to be returned
                            const move = KamisadoMove.of(startCoord, endCoord);
                            const legality = this.isLegal(move, slice);
                            if (legality.legal.isSuccess()) {
                                const result = this.applyLegalMove(move, slice, legality);
                                moves.set(result.resultingMove, result.resultingSlice);
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
    public getListMoves(node: KamisadoNode): MGPMap<KamisadoMove, KamisadoPartSlice> {
        return this.getListMovesFromSlice(node.gamePartSlice);
    }
    // Check if the only possible move is to pass
    public canOnlyPass(slice: KamisadoPartSlice): boolean {
        return this.getMovablePieces(slice).length === 0;
    }
    // Returns the value of the board, as the difference of distance to the win
    public getBoardValue(move: KamisadoMove, slice: KamisadoPartSlice): number {
        const player: Player = slice.getCurrentPlayer();
        if (this.canOnlyPass(slice) && slice.alreadyPassed) {
            return player === Player.ZERO ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
        }
        let furthest0 = 7; // player 0 goes from bottom (7) to top (0)
        let furthest1 = 0; // player 1 goes from top (0) to bottom (7)
        KamisadoBoard.allPieceCoords(slice.board).forEach((c: Coord) => {
            const piece = KamisadoBoard.getPieceAt(slice.board, c);
            if (piece !== KamisadoPiece.NONE) {
                if (piece.player === Player.ONE) { // player 1, top (0) to bottom (7) so we want the max
                    furthest1 = Math.max(furthest1, c.y);
                } else if (piece.player === Player.ZERO) { // player 0, bottom (7) to top (0), so we want the min
                    furthest0 = Math.min(furthest0, c.y);
                }
            }
        });
        // Board value is how far my piece is - how far my opponent piece is, except in case of victory
        if (furthest1 === 7) {
            return Number.MAX_SAFE_INTEGER;
        } else if (furthest0 === 0) {
            return Number.MIN_SAFE_INTEGER;
        } else {
            return furthest1 - (7 - furthest0);
        }
    }
    // Returns the next coord that plays
    public nextCoordToPlay(slice: KamisadoPartSlice, colorToPlay: KamisadoColor): MGPOptional<Coord> {
        return MGPOptional.ofNullable(KamisadoBoard.allPieceCoords(slice.board).find((c: Coord): boolean => {
            const piece: KamisadoPiece = KamisadoBoard.getPieceAt(slice.board, c);
            return piece.player === slice.getCurrentEnnemy() && piece.color === colorToPlay;
        }));
    }
    // Apply the move by only relying on tryMove
    public applyLegalMove(move: KamisadoMove, slice: KamisadoPartSlice, status: LegalityStatus)
    : { resultingMove: KamisadoMove, resultingSlice: KamisadoPartSlice } {
        if (move === KamisadoMove.PASS) {
            const nextCoord: MGPOptional<Coord> = this.nextCoordToPlay(slice, slice.colorToPlay);
            const resultingSlice = new KamisadoPartSlice(slice.turn + 1, slice.colorToPlay, nextCoord, true, slice.board);
            return { resultingSlice, resultingMove: move };
        }
        const start: Coord = move.coord;
        const end: Coord = move.end;

        const newBoard: number[][] = slice.getCopiedBoard();
        newBoard[end.y][end.x] = newBoard[start.y][start.x]; // actual move
        newBoard[start.y][start.x] = KamisadoPiece.NONE.getValue(); // becomes unoccupied
        const newColorToPlay: KamisadoColor = KamisadoBoard.getColorAt(end.x, end.y);

        // Get the next piece that can move
        const nextCoord: MGPOptional<Coord> = this.nextCoordToPlay(slice, newColorToPlay);

        // Construct the next slice
        const resultingSlice = new KamisadoPartSlice(slice.turn + 1, newColorToPlay, nextCoord, false, newBoard);

        return { resultingSlice, resultingMove: move };
    }
    public isLegal(move: KamisadoMove, slice: KamisadoPartSlice): LegalityStatus {
        const start: Coord = move.coord;
        const end: Coord = move.end;
        const colorToPlay: KamisadoColor = slice.colorToPlay;

        if (move === KamisadoMove.PASS) {
            if (this.canOnlyPass(slice) && !slice.alreadyPassed) {
                return { legal: MGPValidation.SUCCESS };
            } else {
                return { legal: MGPValidation.failure('you cannot pass, you can still move') };
            }
        }

        // A move is legal if:
        //   - the move is within the board (this has been checked when constructing the move)
        //   - start piece should be owned by the current player
        const piece: KamisadoPiece = KamisadoBoard.getPieceAt(slice.board, start);
        if (!piece.belongsTo(slice.getCurrentPlayer())) {
            return { legal: MGPValidation.failure('not a piece of the current player') };
        }
        //  - start case should contain a piece of the right color (or any color can be played)
        if (colorToPlay !== KamisadoColor.ANY && piece.color !== colorToPlay) {
            return { legal: MGPValidation.failure('not the right color') };
        }
        //  - end case should be empty
        const endPiece: KamisadoPiece = KamisadoBoard.getPieceAt(slice.board, end);
        if (!endPiece.isEmpty()) {
            return { legal: MGPValidation.failure('end case is not empty') };
        }
        //  - all steps between start and end should be empty
        try {
            const dir: Direction = Direction.fromMove(start, end);
            if (!this.directionAllowedForPlayer(dir, slice.getCurrentPlayer())) {
                return { legal: MGPValidation.failure('direction not allowed for player') };
            }
            let currentCoord: Coord = start;
            while (!currentCoord.equals(end)) {
                currentCoord = currentCoord.getNext(dir);
                if (!KamisadoBoard.getPieceAt(slice.board, currentCoord).isEmpty()) {
                    return { legal: MGPValidation.failure('move is blocked') };
                }
            }
        } catch (e) {
            return { legal: MGPValidation.failure('invalid direction') };
        }
        return { legal: MGPValidation.SUCCESS };
    }
}
