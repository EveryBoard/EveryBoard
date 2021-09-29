import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexaLine } from 'src/app/jscaip/HexaLine';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert } from 'src/app/utils/utils';
import { YinshBoard } from './YinshBoard';
import { YinshFailure } from './YinshFailure';
import { YinshState } from './YinshState';
import { YinshLegalityStatus } from './YinshLegalityStatus';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';

export class YinshNode extends MGPNode<YinshRules, YinshMove, YinshState> { }

export class YinshRules extends Rules<YinshMove, YinshState, YinshLegalityStatus> {

    public applyLegalMove(move: YinshMove, state: YinshState, status: YinshLegalityStatus): YinshState {
        let stateWithoutTurn: YinshState;
        if (status.computedState != null) {
            stateWithoutTurn = status.computedState;
        } else if (move.isInitialPlacement()) {
            stateWithoutTurn = this.applyInitialPlacement(state, move.start);
        } else {
            const stateAfterInitialCaptures: YinshState =
                this.applyCaptures(state, move.initialCaptures);
            const stateAfterMoveAndFlip: YinshState =
                this.applyRingMoveAndFlip(stateAfterInitialCaptures, move.start, move.end.get());
            const stateAfterFinalCaptures: YinshState =
                this.applyCaptures(stateAfterMoveAndFlip, move.finalCaptures);
            stateWithoutTurn = stateAfterFinalCaptures;
        }
        return new YinshState(stateWithoutTurn.board, stateWithoutTurn.sideRings, stateWithoutTurn.turn+1);
        // TODO: dont merge this, move HexaBoard into HexagonalGameState first!!
    }
    private applyInitialPlacement(state: YinshState, coord: Coord): YinshState {
        const player: number = state.getCurrentPlayer().value;
        assert(player < 2, 'YinshRules: state.getCurrentPlayer() can only return player 0 or 1');
        const piece: YinshPiece = YinshPiece.RINGS[player];
        const board: YinshBoard = state.board.setAt(coord, piece);
        const sideRings: [number, number] = [state.sideRings[0], state.sideRings[1]];
        sideRings[player] -= 1;
        return new YinshState(board, sideRings, state.turn);
    }
    public applyCaptures(state: YinshState, captures: ReadonlyArray<YinshCapture>): YinshState {
        let computedState: YinshState = state;
        captures.forEach((capture: YinshCapture) => {
            computedState = this.applyCapture(computedState, capture);
        });
        return computedState;
    }
    public applyCapture(state: YinshState, capture: YinshCapture): YinshState {
        const board: YinshBoard = this.applyCaptureWithoutTakingRing(state, capture);
        return this.takeRing(new YinshState(board, state.sideRings, state.turn), capture.ringTaken);
    }
    public takeRing(state: YinshState, ringTaken: Coord): YinshState {
        const player: number = state.getCurrentPlayer().value;
        const board: YinshBoard = state.board.setAt(ringTaken, YinshPiece.EMPTY);
        const sideRings: [number, number] = [state.sideRings[0], state.sideRings[1]];
        sideRings[player] += 1;
        return new YinshState(board, sideRings, state.turn);
    }
    public applyCaptureWithoutTakingRing(state: YinshState, capture: YinshCapture): YinshBoard {
        // Take all markers
        let board: YinshBoard = state.board;
        capture.forEach((coord: Coord) => {
            board = board.setAt(coord, YinshPiece.EMPTY);
        });
        return board;
    }
    public ringSelectionValidity(state: YinshState, coord: Coord): MGPValidation {
        const player: number = state.getCurrentPlayer().value;
        if (state.board.getAt(coord) === YinshPiece.RINGS[player]) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(YinshFailure.CAPTURE_SHOULD_TAKE_RING);
        }
    }
    public applyRingMoveAndFlip(state: YinshState, start: Coord, end: Coord): YinshState {
        const player: number = state.getCurrentPlayer().value;
        let board: YinshBoard = state.board;
        // Move ring from start (only the marker remains) to
        // end (only the ring can be there, as it must land on an empty space)
        board = board.setAt(start, YinshPiece.MARKERS[player]).setAt(end, YinshPiece.RINGS[player]);
        // Flip all pieces between start and end (both not included)
        // Direction is valid because this function is called with a valid move
        const dir: HexaDirection = HexaDirection.factory.fromMove(start, end).get();
        for (let coord: Coord = start.getNext(dir);
            coord.equals(end) === false;
            coord = coord.getNext(dir)) {
            const piece: YinshPiece = board.getAt(coord);
            if (piece !== YinshPiece.EMPTY) {
                board = board.setAt(coord, piece.flip());
            }
        }
        return new YinshState(board, state.sideRings, state.turn);
    }
    public isLegal(move: YinshMove, state: YinshState): YinshLegalityStatus {
        if (move.isInitialPlacement()) {
            return { legal: this.initialPlacementValidity(state, move.start) };
        }
        if (state.isInitialPlacementPhase()) {
            return { legal: MGPValidation.failure(YinshFailure.NO_MARKERS_IN_INITIAL_PHASE) };
        }

        const initialCapturesValidity: MGPValidation = this.capturesValidity(state, move.initialCaptures);
        if (initialCapturesValidity.isFailure()) {
            return { legal: initialCapturesValidity };
        }
        const stateAfterInitialCaptures: YinshState = this.applyCaptures(state, move.initialCaptures);

        const moveValidity: MGPValidation =
            this.moveValidity(stateAfterInitialCaptures, move.start, move.end.get());
        if (moveValidity.isFailure()) {
            return { legal: moveValidity };
        }
        const stateAfterRingMove: YinshState =
            this.applyRingMoveAndFlip(stateAfterInitialCaptures, move.start, move.end.get());

        const finalCapturesValidity: MGPValidation = this.capturesValidity(stateAfterRingMove, move.finalCaptures);
        if (finalCapturesValidity.isFailure()) {
            return { legal: finalCapturesValidity };
        }
        const stateAfterFinalCaptures: YinshState = this.applyCaptures(stateAfterRingMove, move.finalCaptures);

        const noMoreCapturesValidity: MGPValidation = this.noMoreCapturesValidity(stateAfterFinalCaptures);
        if (noMoreCapturesValidity.isFailure()) {
            return { legal: noMoreCapturesValidity };
        }

        return { legal: MGPValidation.SUCCESS, computedState: stateAfterFinalCaptures };
    }
    public initialPlacementValidity(state: YinshState, coord: Coord): MGPValidation {
        if (state.isInitialPlacementPhase() !== true) {
            return MGPValidation.failure(YinshFailure.PLACEMENT_AFTER_INITIAL_PHASE);
        }
        if (state.board.getAt(coord) !== YinshPiece.EMPTY) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE);
        }
        return MGPValidation.SUCCESS;
    }
    public moveStartValidity(state: YinshState, start: Coord): MGPValidation {
        const player: number = state.getCurrentPlayer().value;
        // Start coord has to contain a ring of the current player
        if (state.board.getAt(start) !== YinshPiece.RINGS[player]) {
            return MGPValidation.failure(YinshFailure.SHOULD_SELECT_PLAYER_RING);
        }
        return MGPValidation.SUCCESS;
    }
    public moveValidity(state: YinshState, start: Coord, end: Coord): MGPValidation {
        const moveStartValidity: MGPValidation = this.moveStartValidity(state, start);
        if (moveStartValidity.isFailure()) {
            return moveStartValidity;
        }
        // End coord has to be empty
        if (state.board.getAt(end) !== YinshPiece.EMPTY) {
            return MGPValidation.failure(YinshFailure.SHOULD_END_MOVE_ON_EMPTY_SPACE);
        }
        // There should only be markers or empty cases between start and end
        // As soon as a marker group is passed, the move should stop on the first empty case
        // There cannot be rings between start and end
        const directionOptional: MGPFallible<HexaDirection> = HexaDirection.factory.fromMove(start, end);
        if (directionOptional.isFailure()) {
            return MGPValidation.failure(YinshFailure.MOVE_DIRECTION_INVALID);
        }
        const direction: HexaDirection = directionOptional.get();
        let markersPassed: boolean = false;
        for (let cur: Coord = start.getNext(direction); cur.equals(end) === false; cur = cur.getNext(direction)) {
            const piece: YinshPiece = state.board.getAt(cur);
            if (piece === YinshPiece.EMPTY) {
                if (markersPassed) {
                    return MGPValidation.failure(YinshFailure.MOVE_SHOULD_END_AT_FIRST_EMPTY_CASE_AFTER_MARKERS);
                }
            } else if (piece.isRing) {
                return MGPValidation.failure(YinshFailure.MOVE_SHOULD_NOT_PASS_ABOVE_RING);
            } else {
                // Piece is a marker
                markersPassed = true;
            }
        }
        return MGPValidation.SUCCESS;
    }
    private capturesValidity(state: YinshState, captures: ReadonlyArray<YinshCapture>):
    MGPValidation {
        let updatedState: YinshState = state;
        for (const capture of captures) {
            const validity: MGPValidation = this.captureValidity(updatedState, capture);
            if (validity.isFailure()) {
                return validity;
            }
            updatedState = this.applyCapture(updatedState, capture);
        }
        return MGPValidation.SUCCESS;
    }
    public captureValidity(state: YinshState, capture: YinshCapture): MGPValidation {
        const player: number = state.getCurrentPlayer().value;
        // There should be exactly 5 consecutive cases, on the same line (invariants of YinshCapture)
        for (const coord of capture.capturedCases) {
            // The captured cases must contain markers of the current player
            if (state.board.getAt(coord) !== YinshPiece.MARKERS[player]) {
                return MGPValidation.failure(YinshFailure.CAN_ONLY_CAPTURE_YOUR_MARKERS);
            }
        }
        // The ring taken should be a ring
        if (state.board.getAt(capture.ringTaken) !== YinshPiece.RINGS[player]) {
            return MGPValidation.failure(YinshFailure.CAPTURE_SHOULD_TAKE_RING);
        }
        return MGPValidation.SUCCESS;
    }
    private noMoreCapturesValidity(state: YinshState): MGPValidation {
        const player: Player = state.getCurrentPlayer();
        const linePortions: ReadonlyArray<{ start: Coord, end: Coord, dir: HexaDirection}> =
            this.getLinePortionsWithAtLeastFivePiecesOfPlayer(state, player);
        if (linePortions.length === 0) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(YinshFailure.MISSING_CAPTURES);
        }
    }
    private getLinePortionsWithAtLeastFivePiecesOfPlayer(state: YinshState, player: Player):
    ReadonlyArray<{ start: Coord, end: Coord, dir: HexaDirection}> {
        const linePortions: { start: Coord, end: Coord, dir: HexaDirection}[] = [];
        state.board.allLines().forEach((line: HexaLine) => {
            const linePortion: MGPOptional<{ start: Coord, end: Coord, dir: HexaDirection}> =
                this.getLinePortionWithAtLeastFivePiecesOfPlayer(state, player, line);
            if (linePortion.isPresent()) {
                linePortions.push(linePortion.get());
            }
        });
        return linePortions;
    }
    private getLinePortionWithAtLeastFivePiecesOfPlayer(state: YinshState, player: Player, line: HexaLine)
    : MGPOptional<{ start: Coord, end: Coord, dir: HexaDirection}>
    {
        let consecutives: number = 0;
        const coord: Coord = state.board.getEntranceOnLine(line);
        const dir: HexaDirection = line.getDirection();
        let start: Coord = coord;
        let cur: Coord;
        for (cur = coord; state.board.isOnBoard(cur); cur = cur.getNext(dir)) {
            const piece: YinshPiece = state.board.getAt(cur);
            if (piece.player === player && piece.isRing === false) {
                if (consecutives === 0) {
                    start = cur;
                }
                consecutives += 1;
            } else {
                if (consecutives >= 5) {
                    // There can only be one portion with at least 5 pieces, we found it
                    break;
                }
                consecutives = 0;
            }
        }
        if (consecutives >= 5) {
            return MGPOptional.of({ start, end: cur, dir });
        }
        return MGPOptional.empty();
    }
    public getPossibleCaptures(state: YinshState): YinshCapture[] {
        const player: Player = state.getCurrentPlayer();
        const captures: YinshCapture[] = [];
        this.getLinePortionsWithAtLeastFivePiecesOfPlayer(state, player)
            .forEach((linePortion: { start: Coord, end: Coord, dir: HexaDirection}) => {
                for (let cur: Coord = linePortion.start;
                    cur.getDistance(linePortion.end) >= 5;
                    cur = cur.getNext(linePortion.dir)) {
                    captures.push(YinshCapture.of(cur, cur.getNext(linePortion.dir, 4), new Coord(-1, -1)));
                }
            });
        return captures;
    }
    public getRingTargets(state: YinshState, start: Coord): Coord[] {
        const targets: Coord[] = [];
        for (const dir of HexaDirection.factory.all) {
            let pieceSeen: boolean = false;
            for (let cur: Coord = start.getNext(dir); state.board.isOnBoard(cur); cur = cur.getNext(dir))
            {
                const piece: YinshPiece = state.board.getAt(cur);
                if (piece === YinshPiece.EMPTY) {
                    targets.push(cur);
                    if (pieceSeen) {
                        // can only land directly after the piece group
                        break;
                    }
                } else if (piece.isRing) {
                    // cannot land on rings nor after them
                    break;
                } else {
                    // track whether we have seen pieces, as we can only jump above one group
                    pieceSeen = true;
                }
            }
        }
        return targets;
    }
    public getGameStatus(node: YinshNode): GameStatus {
        if (node.gameState.isInitialPlacementPhase()) {
            return GameStatus.ONGOING;
        }
        if (node.gameState.sideRings[0] >= 3) {
            return GameStatus.ZERO_WON;
        }
        if (node.gameState.sideRings[1] >= 3) {
            return GameStatus.ONE_WON;
        }
        return GameStatus.ONGOING;
    }
}
