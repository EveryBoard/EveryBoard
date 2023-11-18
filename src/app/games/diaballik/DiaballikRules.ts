import { Rules } from 'src/app/jscaip/Rules';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { DiaballikMove, DiaballikBallPass, DiaballikSubMove, DiaballikTranslation } from './DiaballikMove';
import { DiaballikPiece, DiaballikState } from './DiaballikState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction, Orthogonal } from 'src/app/jscaip/Direction';
import { MGPSet } from 'src/app/utils/MGPSet';
import { GameNode } from 'src/app/jscaip/GameNode';
import { DiaballikFailure } from './DiaballikFailure';
import { Utils } from 'src/app/utils/utils';
import { Table } from 'src/app/utils/ArrayUtils';

export class VictoryOrDefeatCoords {
    protected constructor(public readonly winner: Player) {}
}
export class VictoryCoord extends VictoryOrDefeatCoords {
    public constructor(winner: Player, public readonly coord: Coord) {
        super(winner);
    }
}
export class DefeatCoords extends VictoryOrDefeatCoords {
    public constructor(loser: Player,
                       public readonly allLoserPieces: Coord[],
                       public readonly opponentPiecesInContact: Coord[])
    {
        super(loser.getOpponent());
    }
}

export type DefeatCoordsIncomplete = {
    player: Player,
    allPieces: Coord[],
    piecesInContact: Coord[],
};

export class DiaballikNode extends GameNode<DiaballikMove, DiaballikState> {}

export class DiaballikRules extends Rules<DiaballikMove, DiaballikState, DiaballikState> {

    private static singleton: MGPOptional<DiaballikRules> = MGPOptional.empty();

    public static get(): DiaballikRules {
        if (DiaballikRules.singleton.isAbsent()) {
            DiaballikRules.singleton = MGPOptional.of(new DiaballikRules());
        }
        return DiaballikRules.singleton.get();
    }

    public getInitialState(): DiaballikState {
        const O: DiaballikPiece = DiaballikPiece.ZERO;
        const Ȯ: DiaballikPiece = DiaballikPiece.ZERO_WITH_BALL;
        const X: DiaballikPiece = DiaballikPiece.ONE;
        const Ẋ: DiaballikPiece = DiaballikPiece.ONE_WITH_BALL;
        const _: DiaballikPiece = DiaballikPiece.NONE;
        const board: Table<DiaballikPiece> = [
            [X, X, X, Ẋ, X, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [O, O, O, Ȯ, O, O, O],
        ];
        return new DiaballikState(board, 0);
    }

    public isLegal(move: DiaballikMove, state: DiaballikState): MGPFallible<DiaballikState> {
        let currentState: DiaballikState = state;
        for (const subMove of move.getSubMoves()) {
            const legality: MGPFallible<DiaballikState> = this.isLegalSubMove(currentState, subMove);
            if (legality.isFailure()) {
                return legality;
            }
            currentState = legality.get();
        }
        return MGPFallible.success(currentState);
    }

    public isLegalSubMove(state: DiaballikState, subMove: DiaballikSubMove): MGPFallible<DiaballikState> {
        if (subMove instanceof DiaballikTranslation) {
            return this.isLegalTranslation(state, subMove);
        } else {
            return this.isLegalPass(state, subMove);
        }
    }

    public isLegalTranslation(state: DiaballikState, translation: DiaballikTranslation): MGPFallible<DiaballikState> {
        // The origin must be a piece owned by the player
        const start: Coord = translation.getStart();
        const startPiece: DiaballikPiece = state.getPieceAt(start);
        if (startPiece.owner === PlayerOrNone.NONE) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (startPiece.owner === state.getCurrentOpponent()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        // The moved piece must not hold the ball
        if (startPiece.holdsBall === true) {
            return MGPFallible.failure(DiaballikFailure.CANNOT_MOVE_WITH_BALL());
        }

        // The destination must be empty
        const end: Coord = translation.getEnd();
        if (state.getPieceAt(end).owner.isPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }

        const updatedBoard: DiaballikPiece[][] = state.getCopiedBoard();
        updatedBoard[start.y][start.x] = DiaballikPiece.NONE;
        updatedBoard[end.y][end.x] = startPiece;
        const stateAfterTranslation: DiaballikState = new DiaballikState(updatedBoard, state.turn);
        return MGPFallible.success(stateAfterTranslation);
    }

    public isLegalPass(state: DiaballikState, pass: DiaballikBallPass): MGPFallible<DiaballikState> {
        // The origin must be a piece of the player that holds the ball
        const start: Coord = pass.getStart();
        const startPiece: DiaballikPiece = state.getPieceAt(start);
        if (startPiece.owner === PlayerOrNone.NONE) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (startPiece.owner === state.getCurrentOpponent()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        Utils.assert(startPiece.holdsBall, 'DiaballikRules: cannot pass without the ball');

        // The destination must be a piece of the player
        const end: Coord = pass.getEnd();
        const endPiece: DiaballikPiece = state.getPieceAt(end);
        if (endPiece.owner === PlayerOrNone.NONE) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (endPiece.owner === state.getCurrentOpponent()) {
            return MGPFallible.failure(DiaballikFailure.CANNOT_PASS_TO_OPPONENT());
        }

        // The straight-line path between origin and destination contains no other piece
        const direction: Direction = Direction.factory.fromMove(start, end).get();
        const afterStart: Coord = start.getNext(direction);
        for (let coord: Coord = afterStart; coord.equals(end) === false; coord = coord.getNext(direction)) {
            if (state.getPieceAt(coord) !== DiaballikPiece.NONE) {
                return MGPFallible.failure(DiaballikFailure.PASS_PATH_OBSTRUCTED());
            }
        }

        // We must apply the pass to be able to validate the next submoves
        const updatedBoard: DiaballikPiece[][] = state.getCopiedBoard();
        const withBall: DiaballikPiece = updatedBoard[start.y][start.x];
        const withoutBall: DiaballikPiece = updatedBoard[end.y][end.x];
        updatedBoard[start.y][start.x] = withoutBall;
        updatedBoard[end.y][end.x] = withBall;
        return MGPFallible.success(new DiaballikState(updatedBoard, state.turn));
    }

    public applyLegalMove(_move: DiaballikMove,
                          state: DiaballikState,
                          stateAfterSubMoves: DiaballikState)
    : DiaballikState
    {
        // All submoves have already been applied and are stored in stateAfterSubMoves
        // We only have to update the turn
        return new DiaballikState(stateAfterSubMoves.board, state.turn + 1);
    }

    public getGameStatus(node: DiaballikNode): GameStatus {
        const state: DiaballikState = node.gameState;
        const victoryOrDefeat: MGPOptional<VictoryOrDefeatCoords> = this.getVictoryOrDefeatCoords(state);
        if (victoryOrDefeat.isPresent()) {
            return GameStatus.getVictory(victoryOrDefeat.get().winner);
        } else {
            return GameStatus.ONGOING;
        }
    }

    public getVictoryOrDefeatCoords(state: DiaballikState): MGPOptional<VictoryOrDefeatCoords> {
        // A player wins when their ball is in the opponent's row
        const ballCoordZero: MGPOptional<Coord> = this.getBallCoordInRow(state, 0, Player.ZERO);
        if (ballCoordZero.isPresent()) {
            return MGPOptional.of(new VictoryCoord(Player.ZERO, ballCoordZero.get()));
        }
        const ballCoordOne: MGPOptional<Coord> = this.getBallCoordInRow(state, state.getHeight() - 1, Player.ONE);
        if (ballCoordOne.isPresent()) {
            return MGPOptional.of(new VictoryCoord(Player.ONE, ballCoordOne.get()));
        }
        // The anti-game rule states that if one player blocks the other and there are three pieces in contact,
        // the blocking player loses
        const defeatCoords: MGPOptional<DefeatCoords> = this.getBlockerAndCoords(state);
        return defeatCoords;
    }

    private getBallCoordInRow(state: DiaballikState, y: number, player: Player): MGPOptional<Coord> {
        for (let x: number = 0; x < state.board.length; x++) {
            const piece: DiaballikPiece = state.getPieceAtXY(x, y);
            if (piece.holdsBall === true && piece.owner === player) {
                return MGPOptional.of(new Coord(x, y));
            }
        }
        return MGPOptional.empty();
    }

    private getBlockerAndCoords(state: DiaballikState): MGPOptional<DefeatCoords> {
        // The anti-game rule states that if a player forms a line that blocks the opponent,
        // and that if three opponent's pieces are touching the line, then the blocker loses
        // We check this one player at a time.
        // In case both players form a line, the one that just moved wins.
        const blocking: [MGPOptional<DefeatCoords>, MGPOptional<DefeatCoords>] = [
            this.getBlockerCoords(state, Player.ZERO),
            this.getBlockerCoords(state, Player.ONE),
        ];
        if (blocking[0].isPresent() && blocking[1].isPresent()) {
            // Both players form a line, so the current player loses
            return blocking[state.getCurrentPlayer().value];
        }
        if (blocking[0].isPresent()) return blocking[0];
        if (blocking[1].isPresent()) return blocking[1];
        return MGPOptional.empty();
    }

    private getBlockerCoords(state: DiaballikState, player: Player): MGPOptional<DefeatCoords> {
        // We check if:
        //   - there is one player piece in each column
        //   - they are all connected
        //   - at least 3 opponent's pieces are connected
        const opponentsConnected: MGPSet<Coord> = new MGPSet(); // Needs to be a set to avoid double counting
        const blockerCoords: Coord[] = [];
        for (let x: number = 0; x < state.getWidth(); x++) {
            const coord: MGPOptional<Coord> = this.getConnectedPieceCoord(x, opponentsConnected, state, player);
            if (coord.isPresent()) {
                blockerCoords.push(coord.get());
            } else {
                // No piece found in this column
                return MGPOptional.empty();
            }
        }
        if (opponentsConnected.size() >= 3) {
            return MGPOptional.of(new DefeatCoords(player, blockerCoords, opponentsConnected.toList()));
        } else {
            return MGPOptional.empty();
        }
    }

    private getConnectedPieceCoord(x: number,
                                   opponentsConnected: MGPSet<Coord>,
                                   state: DiaballikState,
                                   player: Player)
    : MGPOptional<Coord>
    {
        for (let y: number = 0; y < state.getHeight(); y++) {
            const coord: Coord = new Coord(x, y);
            if (state.getPieceAt(coord).owner === player) {
                // This is a player piece, it needs to be either in column 0
                // or connected on the left to another player piece for a line to be formed
                if (this.isConnectedOnTheLeft(coord, state, player)) {
                    // The piece is connected, we count the opponents that it touches
                    this.addConnectedOpponents(coord, opponentsConnected, state, player);
                    return MGPOptional.of(coord);
                } else {
                    // This piece is not connected, it is therefore impossible to form a line
                    return MGPOptional.empty();
                }
            }
        }
        return MGPOptional.empty(); // No piece found in this column
    }

    private isConnectedOnTheLeft(coord: Coord, state: DiaballikState, player: Player): boolean {
        if (coord.x === 0) {
            // A piece in the first column is considered connected
            return true;
        }
        for (const direction of [Direction.LEFT, Direction.UP_LEFT, Direction.DOWN_LEFT]) {
            const neighbor: Coord = coord.getNext(direction);
            if (state.isOnBoard(neighbor)) {
                const piece: DiaballikPiece = state.getPieceAt(neighbor);
                if (piece.owner === player) {
                    return true;
                }
            }
        }
        return false;
    }

    private addConnectedOpponents(coord: Coord,
                                  opponentsConnected: MGPSet<Coord>,
                                  state: DiaballikState,
                                  player: Player)
    : void
    {
        for (const direction of Orthogonal.factory.all) {
            const neighbor: Coord = coord.getNext(direction);
            if (state.isOnBoard(neighbor)) {
                const piece: DiaballikPiece = state.getPieceAt(neighbor);
                if (piece.owner === player.getOpponent()) {
                    opponentsConnected.add(neighbor);
                }
            }
        }
    }
}
