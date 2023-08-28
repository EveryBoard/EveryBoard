import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikPiece, DiaballikState } from './DiaballikState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction, Orthogonal } from 'src/app/jscaip/Direction';
import { MGPSet } from 'src/app/utils/MGPSet';

export class DiaballikFailure {

    public static CANNOT_MOVE_WITH_BALL: Localized = () => $localize`You cannot move the piece holding the ball.`;

    public static MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE: Localized = () => $localize`You must move by exactly one orthogonal space.`;

    public static PASS_MUST_BE_STRAIGHT: Localized = () => $localize`A pass must be done in a straight line, orthogonally or vertically`;

    public static PASS_PATH_OBSTRUCTED: Localized = () => $localize`The path of this pass is obstructed`;

    public static PASS_MUST_BE_IN_STRAIGHT_LINE: Localized = () => $localize`A pass must be done in a straight line, orthogonally or diagonally.`;
}

export class DiaballikNode extends MGPNode<Rules<DiaballikMove, DiaballikState, DiaballikState>, DiaballikMove, DiaballikState, DiaballikState> {}

export class DiaballikRules extends Rules<DiaballikMove, DiaballikState, DiaballikState> {

    private static singleton: MGPOptional<DiaballikRules> = MGPOptional.empty();

    public static get(): DiaballikRules {
        if (DiaballikRules.singleton.isAbsent()) {
            DiaballikRules.singleton = MGPOptional.of(new DiaballikRules());
        }
        return DiaballikRules.singleton.get();
    }

    private constructor() {
        super(DiaballikState);
    }

    public isLegal(move: DiaballikMove, state: DiaballikState): MGPFallible<DiaballikState> {
        const firstTranslationLegality: MGPFallible<DiaballikState> =
            this.isLegalTranslation(state, move.firstTranslation);
        if (firstTranslationLegality.isFailure()) {
            return firstTranslationLegality;
        }
        const stateAfterFirstTranslation: DiaballikState = firstTranslationLegality.get();

        const secondTranslationLegality: MGPFallible<DiaballikState> =
            this.isLegalTranslation(stateAfterFirstTranslation, move.secondTranslation);
        if (secondTranslationLegality.isFailure()) {
            return secondTranslationLegality;
        }
        const stateAfterSecondTranslation: DiaballikState = secondTranslationLegality.get();

        const passLegality: MGPFallible<DiaballikState> = this.isLegalPass(stateAfterSecondTranslation, move.pass);
        return passLegality;
    }
    private isLegalTranslation(state: DiaballikState, translation: MGPOptional<MoveCoordToCoord>): MGPFallible<DiaballikState> {
        if (translation.isAbsent()) {
            // An empty translation is legal and does not change anything
            return MGPFallible.success(state);
        }

        // The origin must be a piece owned by the player
        const start: Coord = translation.get().getStart();
        const startPiece: DiaballikPiece = state.getPieceAt(start);
        if (startPiece.owner !== state.getCurrentPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        // The moved piece must not hold the ball
        if (startPiece.holdsBall === true) {
            return MGPFallible.failure(DiaballikFailure.CANNOT_MOVE_WITH_BALL());
        }

        // The destination must be empty
        const end: Coord = translation.get().getEnd();
        if (state.getPieceAt(end).owner !== PlayerOrNone.NONE) {
            return MGPFallible.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }

        const updatedBoard: DiaballikPiece[][] = state.getCopiedBoard();
        updatedBoard[start.y][start.x] = DiaballikPiece.NONE;
        updatedBoard[end.y][end.x] = startPiece;
        const stateAfterTranslation: DiaballikState = new DiaballikState(updatedBoard, state.turn);
        return MGPFallible.success(stateAfterTranslation);
    }
    private isLegalPass(state: DiaballikState, pass: MGPOptional<MoveCoordToCoord>): MGPFallible<DiaballikState> {
        if (pass.isAbsent()) {
            // An empty pass is legal and does not change anything
            return MGPFallible.success(state);
        }

        // The origin must be a piece of the player that holds the ball
        const start: Coord = pass.get().getStart();
        const startPiece: DiaballikPiece = state.getPieceAt(start);
        if (startPiece.owner !== state.getCurrentPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (startPiece.holdsBall === false) {
            return MGPFallible.failure('Cannot pass without the ball');
        }

        // The destination must be a piece of the player
        const end: Coord = pass.get().getEnd();
        const endPiece: DiaballikPiece = state.getPieceAt(end);
        if (endPiece.owner !== state.getCurrentPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }

        // The straight-line path between origin and destination contains no other piece
        const direction: MGPFallible<Direction> = Direction.factory.fromMove(start, end);
        if (direction.isFailure()) {
            return MGPFallible.failure(DiaballikFailure.PASS_MUST_BE_IN_STRAIGHT_LINE());
        }
        const afterStart: Coord = start.getNext(direction.get());
        for (let coord: Coord = afterStart; coord.equals(end) === false; coord = coord.getNext(direction.get())) {
            if (state.getPieceAt(coord) !== DiaballikPiece.NONE) {
                return MGPFallible.failure(DiaballikFailure.PASS_PATH_OBSTRUCTED());
            }
        }
        return MGPFallible.success(state);
    }
    public applyLegalMove(move: DiaballikMove, state: DiaballikState, stateAfterTranslations: DiaballikState): DiaballikState {
        // Both translations have already been applied and are stored in stateAfterTranslations
        // We only have to apply the pass if it is present
        if (move.pass.isPresent()) {
            const updatedBoard: DiaballikPiece[][] = stateAfterTranslations.getCopiedBoard();
            const start: Coord = move.pass.get().getStart();
            const end: Coord = move.pass.get().getEnd();
            const withBall: DiaballikPiece = updatedBoard[start.y][start.x];
            const withoutBall: DiaballikPiece = updatedBoard[end.y][end.x];
            updatedBoard[start.y][start.x] = withoutBall;
            updatedBoard[end.y][end.x] = withBall;
            return new DiaballikState(updatedBoard, state.turn + 1);
        } else {
            return new DiaballikState(stateAfterTranslations.board, state.turn + 1);
        }
    }
    public getGameStatus(node: DiaballikNode): GameStatus {
        const state: DiaballikState = node.gameState;
        // A player wins when their ball is in the opponent's row
        if (this.rowContainsBallOf(state, 0, Player.ONE)) {
            return GameStatus.getVictory(Player.ONE);
        } else if (this.rowContainsBallOf(state, DiaballikState.SIZE-1, Player.ZERO)) {
            return GameStatus.getVictory(Player.ZERO);
        }
        // The anti-game rule states that if one player blocks the other and there are three pieces in contact,
        // the blocking player loses
        const blocker: MGPOptional<Player> = this.findAntiGameBlocker(node.gameState);
        if (blocker.isPresent()) {
            return GameStatus.getDefeat(blocker.get());
        }
        return GameStatus.ONGOING;
    }
    private rowContainsBallOf(state: DiaballikState, y: number, player: Player): boolean {
        for (let x: number = 0; x < DiaballikState.SIZE; x++) {
            const piece: DiaballikPiece = state.getPieceAtXY(x, y);
            if (piece.holdsBall === true && piece.owner === player) {
                return true;
            }
        }
        return false;
    }
    private findAntiGameBlocker(state: DiaballikState): MGPOptional<Player> {
        // The anti-game rule states that if a player forms a line that blocks the opponent,
        // and that if three opponent's pieces are touching the line, then the blocker loses
        // We check this one player at a time
        for (const player of Player.PLAYERS) {
            console.log('checking for player: ' + player)
            // Note: it is impossible for both players to be blockers at the same time
            // (there needs to be a first blocker, and all pieces - 1 should be touching with the opponent,
            // which would imply that the first blocker has already lost)
            if (this.isBlocker(state, player)) {
                return MGPOptional.of(player);
            }
        }
        return MGPOptional.empty();
    }
    private isBlocker(state: DiaballikState, player: Player): boolean {
        // We check if:
        //   - there is one player piece in each column
        //   - they are all connected
        //   - at least 3 opponent's pieces are connected
        let opponentsConnected: MGPSet<Coord> = new MGPSet(); // Needs to be a set to avoid double counting
        for (let x: number = 0; x < DiaballikState.SIZE; x++) {
            let pieceFound: boolean = false;
            for (let y: number = 0; y < DiaballikState.SIZE; y++) {
                const coord: Coord = new Coord(x, y);
                if (state.getPieceAt(coord).owner === player) {
                    // This is a player piece, it needs to be either in column 0
                    // or connected on the left to another player piece for a line to be formed
                    let connected: boolean = false;
                    if (x === 0) {
                        connected = true;
                    } else {
                        for (const direction of [Direction.LEFT, Direction.UP_LEFT, Direction.DOWN_LEFT]) {
                            const neighbor: Coord = coord.getNext(direction);
                            if (DiaballikState.isOnBoard(neighbor)) {
                                const piece: DiaballikPiece = state.getPieceAt(neighbor);
                                if (piece.owner === player) {
                                    connected = true;
                                    break;
                                }
                            }
                        }
                    }
                    for (const direction of Orthogonal.factory.all) {
                        const neighbor: Coord = coord.getNext(direction);
                        if (DiaballikState.isOnBoard(neighbor)) {
                            const piece: DiaballikPiece = state.getPieceAt(neighbor);
                            if (piece.owner === player.getOpponent()) {
                                opponentsConnected.add(neighbor);
                            }
                        }
                    }
                    if (connected === false) {
                        // This piece is not connected, it is impossible to form a line
                        return false;
                    }
                    pieceFound = true;
                    continue; // We found a connected player piece in this column, we can check the next column
                }
            }
            if (pieceFound === false) {
                // No piece found in this column
                return false;
            }
        }
        return opponentsConnected.size() >= 3;
    }
}
