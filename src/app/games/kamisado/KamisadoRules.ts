import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { KamisadoBoard } from './KamisadoBoard';
import { KamisadoColor } from './KamisadoColor';
import { KamisadoMove } from './KamisadoMove';
import { KamisadoState } from './KamisadoState';
import { KamisadoPiece } from './KamisadoPiece';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { KamisadoFailure } from './KamisadoFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { assert } from 'src/app/utils/utils';

export class KamisadoNode extends MGPNode<KamisadoRules, KamisadoMove, KamisadoState> { }

export class KamisadoRules extends Rules<KamisadoMove, KamisadoState> {

    public static getColorMatchingPiece(state: KamisadoState): Array<Coord> {
        if (state.coordToPlay.isPresent()) {
            // Only one piece can move, and its coord is stored in state.coordToPlay
            return [state.coordToPlay.get()];
        }
        // Otherwise, this is the first turn and all pieces can move
        // Player 0 starts the game, so we don't have to compute the list of movable pieces
        return [
            new Coord(0, 7),
            new Coord(1, 7),
            new Coord(2, 7),
            new Coord(3, 7),
            new Coord(4, 7),
            new Coord(5, 7),
            new Coord(6, 7),
            new Coord(7, 7),
        ];
    }
    public static getMovablePieces(state: KamisadoState): Array<Coord> {
        return KamisadoRules.getColorMatchingPiece(state)
            .filter((startCoord: Coord): boolean => {
                // For each direction, create a move of 1 in that direction
                for (const dir of this.playerDirections(state.getCurrentPlayer())) {
                    const endCoord: Coord = startCoord.getNext(dir);
                    if (state.isOnBoard(endCoord) && KamisadoBoard.isEmptyAt(state.board, endCoord)) {
                        // Move is legal
                        return true;
                    }
                }
                return false;
            });
    }
    // Returns the directions allowed for the move of a player
    public static playerDirections(player: Player): Array<Direction> {
        if (player === Player.ONE) {
            return [Direction.DOWN, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];
        } else if (player === Player.ZERO) {
            return [Direction.UP, Direction.UP_LEFT, Direction.UP_RIGHT];
        } else {
            throw new Error('Invalid player');
        }
    }
    // Check if a direction is allowed for a given player
    public static directionAllowedForPlayer(dir: Direction, player: Player): boolean {
        if (player === Player.ZERO) {
            return dir.y < 0;
        } else if (player === Player.ONE) {
            return dir.y > 0;
        } else {
            throw new Error('Invalid player');
        }
    }
    // Returns the list of moves of a player
    public static getListMovesFromState(state: KamisadoState): KamisadoMove[] {
        const movablePieces: Coord[] = KamisadoRules.getMovablePieces(state);
        if (movablePieces.length === 0) {
            // No move, player can only pass
            // Still these are not called after the game is ended
            assert(state.alreadyPassed === false, 'getListMovesFromState should not be called once game is ended.');
            return [KamisadoMove.PASS];
        } else {
            return KamisadoRules.getListMovesFromNonBlockedState(state, movablePieces);
        }
    }
    static getListMovesFromNonBlockedState(state: KamisadoState, movablePieces: Coord[]): KamisadoMove[] {
        // There are moves, compute them
        const moves: KamisadoMove[] = [];
        const player: Player = state.getCurrentPlayer();
        // Get all the pieces that can play
        for (const startCoord of movablePieces) {
            // For each piece, look at all positions where it can go
            for (const dir of KamisadoRules.playerDirections(player)) {
                // For each direction, create a move of i in that direction
                for (let stepSize: number = 1; stepSize < KamisadoBoard.SIZE; stepSize++) {
                    const endCoord: Coord = startCoord.getNext(dir, stepSize);
                    if (state.isOnBoard(endCoord) && KamisadoBoard.isEmptyAt(state.board, endCoord)) {
                        // Check if the move can be done, and if so,
                        // add the resulting state to the map to be returned
                        const move: KamisadoMove = KamisadoMove.of(startCoord, endCoord);
                        moves.push(move);
                    } else {
                        break;
                    }
                }
            }
        }
        return moves;
    }
    // Check if the only possible move is to pass
    public static mustPass(state: KamisadoState): boolean {
        return this.getMovablePieces(state).length === 0;
    }
    public static getFurthestPiecePositions(state: KamisadoState): [number, number] {
        let furthest0: number = 7; // player 0 goes from bottom (7) to top (0)
        let furthest1: number = 0; // player 1 goes from top (0) to bottom (7)

        KamisadoBoard.allPieceCoords(state.board).forEach((c: Coord) => {
            const piece: KamisadoPiece = state.getPieceAt(c);
            assert(piece !== KamisadoPiece.NONE, 'allPieceCoords failed to filter KamisadoPiece.NONE');
            if (piece.player === Player.ONE) { // player 1, top (0) to bottom (7) so we want the max
                furthest1 = Math.max(furthest1, c.y);
            } else { // player 0, bottom (7) to top (0), so we want the min
                furthest0 = Math.min(furthest0, c.y);
            }
        });
        return [furthest0, furthest1];
    }
    public static isLegal(move: KamisadoMove, state: KamisadoState): MGPFallible<void> {
        const start: Coord = move.coord;
        const end: Coord = move.end;
        const colorToPlay: KamisadoColor = state.colorToPlay;

        if (move === KamisadoMove.PASS) {
            if (this.mustPass(state) && !state.alreadyPassed) {
                return MGPFallible.success(undefined);
            } else {
                return MGPFallible.failure(RulesFailure.CANNOT_PASS());
            }
        }

        if (KamisadoRules.isVictory(state)) {
            return MGPFallible.failure('You should never see this message');
        }

        // A move is legal if:
        //   - the move is within the board (this has been checked when constructing the move)
        //   - start piece should be owned by the current player
        const piece: KamisadoPiece = state.getPieceAt(start);
        if (!piece.belongsTo(state.getCurrentPlayer())) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        //  - start case should contain a piece of the right color (or any color can be played)
        if (colorToPlay !== KamisadoColor.ANY && piece.color !== colorToPlay) {
            return MGPFallible.failure(KamisadoFailure.NOT_RIGHT_COLOR());
        }
        //  - end case should be empty
        const endPiece: KamisadoPiece = state.getPieceAt(end);
        if (!endPiece.isEmpty()) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
        //  - move direction is linear
        const directionOptional: MGPFallible<Direction> = Direction.factory.fromMove(start, end);
        if (directionOptional.isFailure()) {
            return MGPFallible.failure(KamisadoFailure.DIRECTION_NOT_ALLOWED());
        }
        //  - move direction is toward the opponent's line
        const dir: Direction = directionOptional.get();
        if (!KamisadoRules.directionAllowedForPlayer(dir, state.getCurrentPlayer())) {
            return MGPFallible.failure(KamisadoFailure.DIRECTION_NOT_ALLOWED());
        }
        //  - there is no piece between starting and landing coord
        let currentCoord: Coord = start;
        while (!currentCoord.equals(end)) {
            currentCoord = currentCoord.getNext(dir);
            if (!state.getPieceAt(currentCoord).isEmpty()) {
                return MGPFallible.failure(KamisadoFailure.MOVE_BLOCKED());
            }
        }
        return MGPFallible.success(undefined);
    }
    private static isVictory(state: KamisadoState): boolean {
        const [furthest0, furthest1]: [number, number] = this.getFurthestPiecePositions(state);
        return furthest0 === 0 || furthest1 === 7;
    }
    // Returns the next coord that plays
    public nextCoordToPlay(state: KamisadoState, colorToPlay: KamisadoColor): MGPOptional<Coord> {
        return MGPOptional.ofNullable(KamisadoBoard.allPieceCoords(state.board).find((c: Coord): boolean => {
            const piece: KamisadoPiece = state.getPieceAt(c);
            return piece.player === state.getCurrentOpponent() && piece.color === colorToPlay;
        }));
    }
    // Apply the move by only relying on tryMove
    public applyLegalMove(move: KamisadoMove, state: KamisadoState, _status: void): KamisadoState {
        if (move === KamisadoMove.PASS) {
            const nextCoord: MGPOptional<Coord> = this.nextCoordToPlay(state, state.colorToPlay);
            const resultingState: KamisadoState =
                new KamisadoState(state.turn + 1, state.colorToPlay, nextCoord, true, state.board);
            return resultingState;
        }
        const start: Coord = move.coord;
        const end: Coord = move.end;

        const newBoard: KamisadoPiece[][] = state.getCopiedBoard();
        newBoard[end.y][end.x] = newBoard[start.y][start.x]; // actual move
        newBoard[start.y][start.x] = KamisadoPiece.NONE; // becomes unoccupied
        const newColorToPlay: KamisadoColor = KamisadoBoard.getColorAt(end.x, end.y);

        // Get the next piece that can move
        const nextCoord: MGPOptional<Coord> = this.nextCoordToPlay(state, newColorToPlay);

        // Construct the next state
        const resultingState: KamisadoState =
            new KamisadoState(state.turn + 1, newColorToPlay, nextCoord, false, newBoard);

        return resultingState;
    }
    public isLegal(move: KamisadoMove, state: KamisadoState): MGPFallible<void> {
        return KamisadoRules.isLegal(move, state);
    }
    public getGameStatus(node: KamisadoNode): GameStatus {
        const state: KamisadoState = node.gameState;
        const player: Player = state.getCurrentPlayer();
        if (KamisadoRules.mustPass(state) && state.alreadyPassed) {
            return GameStatus.getDefeat(player);
        }

        const [furthest0, furthest1]: [number, number] = KamisadoRules.getFurthestPiecePositions(state);
        // Board value is how far my piece is - how far my opponent piece is, except in case of victory
        if (furthest1 === 7) {
            return GameStatus.ONE_WON;
        } else if (furthest0 === 0) {
            return GameStatus.ZERO_WON;
        } else {
            return GameStatus.ONGOING;
        }
    }
}
