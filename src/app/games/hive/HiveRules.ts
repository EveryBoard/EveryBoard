import { Coord } from 'src/app/jscaip/Coord';
import { HexagonalUtils } from 'src/app/jscaip/HexagonalUtils';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { HiveFailure } from './HiveFailure';
import { HiveMoveDrop, HiveMove, HiveMoveCoordToCoord } from './HiveMove';
import { HivePiece, HivePieceStack } from './HivePiece';
import { HivePieceRules } from './HivePieceRules';
import { HiveState } from './HiveState';

export class HiveNode extends MGPNode<HiveRules, HiveMove, HiveState> {}

export class HiveRules extends Rules<HiveMove, HiveState> {

    private static singleton: MGPOptional<HiveRules> = MGPOptional.empty();

    public static get(): HiveRules {
        if (HiveRules.singleton.isAbsent()) {
            HiveRules.singleton = MGPOptional.of(new HiveRules());
        }
        return HiveRules.singleton.get();
    }
    private constructor() {
        super(HiveState);
    }
    public applyLegalMove(move: HiveMove, state: HiveState, _info: void): HiveState {
        if (move instanceof HiveMoveDrop) {
            return this.applyLegalDrop(move, state);
        } else if (move instanceof HiveMoveCoordToCoord) {
            return this.applyLegalMoveCoordToCoord(move, state);
        } else {
            // Move is pass
            return state.update().increaseTurnAndFinalizeUpdate();
        }
    }
    private applyLegalDrop(drop: HiveMoveDrop, state: HiveState): HiveState {
        // Put the piece where it is dropped, possibly on top of other pieces
        const pieceStack: HivePieceStack = state.getAt(drop.coord);
        return state.update()
            .setAt(drop.coord, pieceStack.add(drop.piece))
            .removeRemainingPiece(drop.piece)
            .increaseTurnAndFinalizeUpdate();
    }
    private applyLegalMoveCoordToCoord(move: HiveMoveCoordToCoord, state: HiveState): HiveState {
        // Take the top piece of the source and move it on top of the destination
        const sourcePieceStack: HivePieceStack = state.getAt(move.getStart());
        const destinationPieceStack: HivePieceStack = state.getAt(move.getEnd());
        return state.update()
            .setAt(move.getStart(), sourcePieceStack.removeTopPiece())
            .setAt(move.getEnd(), destinationPieceStack.add(sourcePieceStack.topPiece()))
            .increaseTurnAndFinalizeUpdate();
    }
    public isLegal(move: HiveMove, state: HiveState): MGPFallible<void> {
        if (move instanceof HiveMoveDrop) {
            return this.isLegalDrop(move, state);
        } else if (move instanceof HiveMoveCoordToCoord) {
            return this.isLegalMoveCoordToCoord(move, state);
        } else {
            // Move is pass
            if (this.shouldPass(state)) {
                return MGPFallible.success(undefined);
            } else {
                return MGPFallible.failure(RulesFailure.CANNOT_PASS());
            }
        }
    }
    public isLegalMoveCoordToCoord(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (state.queenBeeLocation(state.getCurrentPlayer()).isPresent() === false) {
            return MGPFallible.failure(HiveFailure.QUEEN_BEE_MUST_BE_ON_BOARD_BEFORE_MOVE());
        }
        const stack: HivePieceStack = state.getAt(move.getStart());
        if (stack.isEmpty()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        const movedPiece: HivePiece = stack.topPiece();
        if (movedPiece.owner === state.getCurrentOpponent()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }

        const moveValidity: MGPFallible<void> = HivePieceRules.from(movedPiece).moveValidity(move, state);
        if (moveValidity.isFailure()) {
            return moveValidity;
        }
        const stateWithoutMovedPiece: HiveState = state.update()
            .setAt(move.getStart(), stack.removeTopPiece())
            .increaseTurnAndFinalizeUpdate();
        if (stateWithoutMovedPiece.isDisconnected()) {
            // Cannot disconnect the hive, even in the middle of a move
            return MGPFallible.failure(HiveFailure.CANNOT_DISCONNECT_HIVE());
        }
        const newEnd: Coord = move.getEnd().getNext(stateWithoutMovedPiece.offset);
        if (stateWithoutMovedPiece.numberOfNeighbors(newEnd) === 0) {
            // Cannot disconnect the hive after the move, i.e., the destination should have one occupied neighbor
            return MGPFallible.failure(HiveFailure.CANNOT_DISCONNECT_HIVE());
        }
        return MGPFallible.success(undefined);
    }
    public mustPlaceQueenBee(state: HiveState): boolean {
        return state.turn >= 6 && state.hasQueenBeeOnBoard(state.getCurrentPlayer()) === false;
    }
    public isLegalDrop(move: HiveMoveDrop, state: HiveState): MGPFallible<void> {
        const player: Player = state.getCurrentPlayer();
        // This should be a piece of the player
        if (move.piece.owner === player.getOpponent()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        // The player must have the piece in its reserve to drop it
        if (state.remainingPieces.hasRemaining(move.piece) === false) {
            return MGPFallible.failure(HiveFailure.CANNOT_DROP_PIECE_YOU_DONT_HAVE());
        }
        // The queen bee must be placed at the latest at the fourth turn of a player
        if (move.piece.kind !== 'QueenBee' && this.mustPlaceQueenBee(state)) {
            return MGPFallible.failure(HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN());
        }
        // Pieces must be connected to the hive, except at the first turn of player zero,
        // but must not be dropped next to a piece of the opponent, except at the first turn of player one
        const neighborValidity: MGPFallible<void> = this.checkNeighborValidity(move, state);
        if (neighborValidity.isFailure()) {
            return neighborValidity;
        }
        // Pieces must be dropped on an empty space (even the beetle)
        if (state.getAt(move.coord).hasPieces()) {
            return MGPFallible.failure(HiveFailure.MUST_DROP_ON_EMPTY_SPACE());
        }
        return MGPFallible.success(undefined);
    }
    private checkNeighborValidity(move: HiveMoveDrop, state: HiveState): MGPFallible<void> {
        const player: Player = state.getCurrentPlayer();
        let hasNeighbor: boolean = false;
        for (const neighbor of HexagonalUtils.getNeighbors(move.coord)) {
            const neighborStack: HivePieceStack = state.getAt(neighbor);
            if (neighborStack.hasPieces()) {
                hasNeighbor = true;
                if (state.turn !== 1 && neighborStack.topPiece().owner === player.getOpponent()) {
                    return MGPFallible.failure(HiveFailure.CANNOT_DROP_NEXT_TO_OPPONENT());
                }
            }
        }
        if (state.turn !== 0 && hasNeighbor === false) {
            return MGPFallible.failure(HiveFailure.MUST_BE_CONNECTED_TO_HIVE());
        }
        return MGPFallible.success(undefined);
    }
    public getPossibleDropLocations(state: HiveState): MGPSet<Coord> {
        const player: Player = state.getCurrentPlayer();
        // At turn 0 and 1, the possible drop locations are already known
        if (state.turn === 0) {
            return new MGPSet([new Coord(0, 0)]);
        }
        if (state.turn === 1) {
            return new MGPSet(HexagonalUtils.getNeighbors(new Coord(0, 0)));
        }

        const remainingPieceOpt: MGPOptional<HivePiece> = state.remainingPieces.getAny(player);
        if (remainingPieceOpt.isAbsent()) {
            return new MGPSet();
        }

        const remainingPiece: HivePiece = remainingPieceOpt.get();
        const locations: MGPSet<Coord> = new MGPSet();
        // We can only drop next to one of our piece
        for (const coord of state.occupiedSpaces()) {
            if (state.getAt(coord).topPiece().owner === player) {
                for (const neighbor of state.emptyNeighbors(coord)) {
                    const move: HiveMoveDrop = HiveMoveDrop.from(remainingPiece, neighbor);
                    if (this.isLegalDrop(move, state).isSuccess()) {
                        locations.add(neighbor);
                    }
                }
            }
        }
        return locations;
    }
    public getPossibleMovesFrom(state: HiveState, coord: Coord): MGPSet<HiveMoveCoordToCoord> {
        const player: Player = state.getCurrentPlayer();
        const moves: MGPSet<HiveMoveCoordToCoord> = new MGPSet();
        const topPiece: HivePiece = state.getAt(coord).topPiece();
        if (topPiece.owner === player) {
            for (const move of HivePieceRules.from(topPiece).getPotentialMoves(coord, state)) {
                if (this.isLegalMoveCoordToCoord(move, state).isSuccess()) {
                    moves.add(move);
                }
            }
        }
        return moves;
    }
    public getPossibleMovesOnBoard(state: HiveState): MGPSet<HiveMoveCoordToCoord> {
        const moves: MGPSet<HiveMoveCoordToCoord> = new MGPSet();
        for (const coord of state.occupiedSpaces()) {
            moves.addAll(this.getPossibleMovesFrom(state, coord));
        }
        return moves;
    }
    public shouldPass(state: HiveState): boolean {
        return this.getPossibleDropLocations(state).size() === 0 && this.getPossibleMovesOnBoard(state).size() === 0;
    }
    public getGameStatus(node: HiveNode): GameStatus {
        const state: HiveState = node.gameState;

        const neighbors: [number, number] = [0, 0];
        for (const player of Player.PLAYERS) {
            const queenBeeLocation: MGPOptional<Coord> = state.queenBeeLocation(player);
            if (queenBeeLocation.isPresent()) {
                neighbors[player.value] = state.numberOfNeighbors(queenBeeLocation.get());
            }
        }
        if (neighbors[0] === 6 && neighbors[1] === 6) {
            return GameStatus.DRAW;
        } else if (neighbors[0] === 6) {
            return GameStatus.getVictory(Player.ONE);
        } else if (neighbors[1] === 6) {
            return GameStatus.getVictory(Player.ZERO);
        }

        return GameStatus.ONGOING;
    }
}
