import { Coord } from 'src/app/jscaip/Coord';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { Player } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional, Set, MGPValidation } from '@everyboard/lib';
import { HiveFailure } from './HiveFailure';
import { HiveDropMove, HiveMove, HiveCoordToCoordMove } from './HiveMove';
import { HivePiece, HivePieceStack } from './HivePiece';
import { HivePieceRules } from './HivePieceRules';
import { HiveState } from './HiveState';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Table } from 'src/app/jscaip/TableUtils';
import { HexagonalUtils } from 'src/app/jscaip/HexagonalUtils';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { CoordSet } from 'src/app/jscaip/CoordSet';

export class HiveNode extends GameNode<HiveMove, HiveState> {}

export class HiveRules extends Rules<HiveMove, HiveState> {

    private static singleton: MGPOptional<HiveRules> = MGPOptional.empty();

    public static get(): HiveRules {
        if (HiveRules.singleton.isAbsent()) {
            HiveRules.singleton = MGPOptional.of(new HiveRules());
        }
        return HiveRules.singleton.get();
    }

    public override getInitialState(): HiveState {
        const board: Table<HivePiece[]> = [];
        return HiveState.fromRepresentation(board, 0);
    }

    public override applyLegalMove(move: HiveMove,
                                   state: HiveState,
                                   _config: NoConfig,
                                   _info: void)
    : HiveState
    {
        if (move instanceof HiveDropMove) {
            return this.applyLegalDrop(move, state);
        } else if (move instanceof HiveCoordToCoordMove) {
            return this.applyLegalMoveCoordToCoord(move, state);
        } else {
            // Move is pass
            return state.update().increaseTurnAndFinalizeUpdate();
        }
    }

    private applyLegalDrop(drop: HiveDropMove, state: HiveState): HiveState {
        // Put the piece where it is dropped, possibly on top of other pieces
        const pieceStack: HivePieceStack = state.getAt(drop.coord);
        return state.update()
            .setAt(drop.coord, pieceStack.add(drop.piece))
            .removeRemainingPiece(drop.piece)
            .increaseTurnAndFinalizeUpdate();
    }

    private applyLegalMoveCoordToCoord(move: HiveCoordToCoordMove, state: HiveState): HiveState {
        // Take the top piece of the source and move it on top of the destination
        const sourcePieceStack: HivePieceStack = state.getAt(move.getStart());
        const destinationPieceStack: HivePieceStack = state.getAt(move.getEnd());
        return state.update()
            .setAt(move.getStart(), sourcePieceStack.removeTopPiece())
            .setAt(move.getEnd(), destinationPieceStack.add(sourcePieceStack.topPiece()))
            .increaseTurnAndFinalizeUpdate();
    }

    public override isLegal(move: HiveMove, state: HiveState): MGPValidation {
        if (move instanceof HiveDropMove) {
            return this.isLegalDrop(move, state);
        } else if (move instanceof HiveCoordToCoordMove) {
            return this.isLegalMoveCoordToCoord(move, state);
        } else {
            // Move is pass
            if (this.shouldPass(state)) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure(RulesFailure.CANNOT_PASS());
            }
        }
    }

    public isLegalMoveCoordToCoord(move: HiveCoordToCoordMove, state: HiveState): MGPValidation {
        if (state.queenBeeLocation(state.getCurrentPlayer()).isPresent() === false) {
            return MGPValidation.failure(HiveFailure.QUEEN_BEE_MUST_BE_ON_BOARD_BEFORE_MOVE());
        }
        const stack: HivePieceStack = state.getAt(move.getStart());
        if (stack.isEmpty()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        const movedPiece: HivePiece = stack.topPiece();
        if (movedPiece.owner === state.getCurrentOpponent()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }

        const moveValidity: MGPValidation = HivePieceRules.of(movedPiece).moveValidity(move, state);
        if (moveValidity.isFailure()) {
            return moveValidity;
        }
        const stateWithoutMovedPiece: HiveState = state.update()
            .setAt(move.getStart(), stack.removeTopPiece())
            .increaseTurnAndFinalizeUpdate();
        if (stateWithoutMovedPiece.isDisconnected()) {
            // Cannot disconnect the hive, even in the middle of a move
            return MGPValidation.failure(HiveFailure.CANNOT_DISCONNECT_HIVE());
        }
        const newEnd: Coord = move.getEnd();
        if (stateWithoutMovedPiece.numberOfNeighbors(newEnd) === 0) {
            // Cannot disconnect the hive after the move, i.e., the destination should have one occupied neighbor
            return MGPValidation.failure(HiveFailure.CANNOT_DISCONNECT_HIVE());
        }
        return MGPValidation.SUCCESS;
    }

    public mustPlaceQueenBee(state: HiveState): boolean {
        return 6 <= state.turn && state.hasQueenBeeOnBoard(state.getCurrentPlayer()) === false;
    }

    public isLegalDrop(move: HiveDropMove, state: HiveState): MGPValidation {
        const player: Player = state.getCurrentPlayer();
        // This should be a piece of the player
        if (move.piece.owner === player.getOpponent()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        // The player must have the piece in its reserve to drop it
        if (state.remainingPieces.hasRemaining(move.piece) === false) {
            return MGPValidation.failure(HiveFailure.CANNOT_DROP_PIECE_YOU_DONT_HAVE());
        }
        // The queen bee must be placed at the latest at the fourth turn of a player
        if (move.piece.kind !== 'QueenBee' && this.mustPlaceQueenBee(state)) {
            return MGPValidation.failure(HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN());
        }
        // Pieces must be connected to the hive, except at the first turn of player zero,
        // but must not be dropped next to a piece of the opponent, except at the first turn of player one
        const neighborValidity: MGPValidation = this.checkNeighborValidity(move, state);
        if (neighborValidity.isFailure()) {
            return neighborValidity;
        }
        // Pieces must be dropped on an empty space (even the beetle)
        if (state.getAt(move.coord).hasPieces()) {
            return MGPValidation.failure(HiveFailure.MUST_DROP_ON_EMPTY_SPACE());
        }
        return MGPValidation.SUCCESS;
    }

    private checkNeighborValidity(move: HiveDropMove, state: HiveState): MGPValidation {
        const player: Player = state.getCurrentPlayer();
        let hasNeighbor: boolean = false;
        for (const neighbor of HexagonalUtils.getNeighbors(move.coord)) {
            const neighborStack: HivePieceStack = state.getAt(neighbor);
            if (neighborStack.hasPieces()) {
                hasNeighbor = true;
                if (state.turn !== 1 && neighborStack.topPiece().owner === player.getOpponent()) {
                    return MGPValidation.failure(HiveFailure.CANNOT_DROP_NEXT_TO_OPPONENT());
                }
            }
        }
        if (state.turn !== 0 && hasNeighbor === false) {
            return MGPValidation.failure(HiveFailure.MUST_BE_CONNECTED_TO_HIVE());
        }
        return MGPValidation.SUCCESS;
    }

    public getPossibleDropLocations(state: HiveState): CoordSet {
        const player: Player = state.getCurrentPlayer();
        // At turn 0 and 1, the possible drop locations are already known
        if (state.turn === 0) {
            return new CoordSet([new Coord(0, 0)]);
        }
        if (state.turn === 1) {
            return new CoordSet(HexagonalUtils.getNeighbors(new Coord(0, 0)));
        }

        const remainingPieceOpt: MGPOptional<HivePiece> = state.remainingPieces.getAny(player);
        if (remainingPieceOpt.isAbsent()) {
            return new CoordSet();
        }

        const remainingPiece: HivePiece = remainingPieceOpt.get();
        let locations: CoordSet = new CoordSet();
        // We can only drop next to one of our piece
        for (const coord of state.occupiedSpaces()) {
            if (state.getAt(coord).topPiece().owner === player) {
                for (const neighbor of state.emptyNeighbors(coord)) {
                    const move: HiveDropMove = HiveDropMove.of(remainingPiece, neighbor);
                    if (this.isLegalDrop(move, state).isSuccess()) {
                        locations = locations.addElement(neighbor);
                    }
                }
            }
        }
        return locations;
    }

    public getPossibleMovesFrom(state: HiveState, coord: Coord): Set<HiveCoordToCoordMove> {
        const player: Player = state.getCurrentPlayer();
        let moves: Set<HiveCoordToCoordMove> = new Set();
        const topPiece: HivePiece = state.getAt(coord).topPiece();
        if (topPiece.owner === player) {
            for (const move of HivePieceRules.of(topPiece).getPotentialMoves(coord, state)) {
                if (this.isLegalMoveCoordToCoord(move, state).isSuccess()) {
                    moves = moves.addElement(move);
                }
            }
        }
        return moves;
    }

    public getPossibleMovesOnBoard(state: HiveState): Set<HiveCoordToCoordMove> {
        let moves: Set<HiveCoordToCoordMove> = new Set();
        for (const coord of state.occupiedSpaces()) {
            moves = moves.union(this.getPossibleMovesFrom(state, coord));
        }
        return moves;
    }

    public shouldPass(state: HiveState): boolean {
        return this.getPossibleDropLocations(state).size() === 0 && this.getPossibleMovesOnBoard(state).size() === 0;
    }

    public override getGameStatus(node: HiveNode): GameStatus {
        const state: HiveState = node.gameState;

        const neighbors: PlayerNumberMap = PlayerNumberMap.of(0, 0);
        for (const player of Player.PLAYERS) {
            const queenBeeLocation: MGPOptional<Coord> = state.queenBeeLocation(player);
            if (queenBeeLocation.isPresent()) {
                neighbors.put(player, state.numberOfNeighbors(queenBeeLocation.get()));
            }
        }
        const neighborsZero: number = neighbors.get(Player.ZERO);
        const neighborsOne: number = neighbors.get(Player.ONE);
        if (neighborsZero === 6 && neighborsOne === 6) {
            return GameStatus.DRAW;
        } else if (neighborsZero === 6) {
            return GameStatus.getVictory(Player.ONE);
        } else if (neighborsOne === 6) {
            return GameStatus.getVictory(Player.ZERO);
        }

        return GameStatus.ONGOING;
    }

}
