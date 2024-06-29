import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexaLine } from 'src/app/jscaip/HexaLine';
import { Player } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible, MGPOptional, MGPValidation } from '@everyboard/lib';
import { YinshFailure } from './YinshFailure';
import { YinshState } from './YinshState';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Table } from 'src/app/jscaip/TableUtils';

export type YinshLegalityInformation = YinshState;

export class YinshNode extends GameNode<YinshMove, YinshState> {}

export class YinshRules extends Rules<YinshMove, YinshState, YinshLegalityInformation> {

    private static singleton: MGPOptional<YinshRules> = MGPOptional.empty();

    public static get(): YinshRules {
        if (YinshRules.singleton.isAbsent()) {
            YinshRules.singleton = MGPOptional.of(new YinshRules());
        }
        return YinshRules.singleton.get();
    }

    public override getInitialState(): YinshState {
        const _: YinshPiece = YinshPiece.EMPTY;
        const N: YinshPiece = YinshPiece.UNREACHABLE;
        const board: Table<YinshPiece> = [
            [N, N, N, N, N, N, _, _, _, _, N],
            [N, N, N, N, _, _, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, N, N],
            [_, _, _, _, _, _, _, _, N, N, N],
            [_, _, _, _, _, _, _, N, N, N, N],
            [N, _, _, _, _, N, N, N, N, N, N],
        ];
        return new YinshState(board, PlayerNumberMap.of(5, 5), 0);
    }

    public override applyLegalMove(_move: YinshMove, _state: YinshState, _config: NoConfig, info: YinshState)
    : YinshState
    {
        const stateWithoutTurn: YinshState = info;
        return new YinshState(stateWithoutTurn.board, stateWithoutTurn.sideRings, stateWithoutTurn.turn + 1);
    }

    public applyCaptures(captures: ReadonlyArray<YinshCapture>, state: YinshState): YinshState {
        let computedState: YinshState = state;
        captures.forEach((capture: YinshCapture) => {
            computedState = this.applyCapture(capture, computedState);
        });
        return computedState;
    }

    public applyCapture(capture: YinshCapture, state: YinshState): YinshState {
        const board: Table<YinshPiece> = this.applyCaptureWithoutTakingRing(state, capture);
        return this.takeRing(new YinshState(board, state.sideRings, state.turn), capture.ringTaken.get());
    }

    public takeRing(state: YinshState, ringTaken: Coord): YinshState {
        const player: Player = state.getCurrentPlayer();
        const board: Table<YinshPiece> = state.setAt(ringTaken, YinshPiece.EMPTY).board;
        const sideRings: PlayerNumberMap = state.sideRings.getCopy();
        sideRings.add(player, 1);
        return new YinshState(board, sideRings, state.turn);
    }

    public applyCaptureWithoutTakingRing(state: YinshState, capture: YinshCapture): Table<YinshPiece> {
        // Take all markers
        capture.forEach((coord: Coord) => {
            state = state.setAt(coord, YinshPiece.EMPTY);
        });
        return state.board;
    }

    public ringSelectionValidity(state: YinshState, coord: Coord): MGPValidation {
        const player: Player = state.getCurrentPlayer();
        if (state.getPieceAt(coord) === YinshPiece.RINGS.get(player)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(YinshFailure.CAPTURE_SHOULD_TAKE_RING());
        }
    }

    public applyRingMoveAndFlip(start: Coord, end: Coord, state: YinshState): YinshState {
        const player: Player = state.getCurrentPlayer();
        // Move ring from start (only the marker remains) to
        // end (only the ring can be there, as it must land on an empty space)
        let newState: YinshState = state.setAt(start, YinshPiece.MARKERS.get(player));
        newState = newState.setAt(end, YinshPiece.RINGS.get(player));
        // Flip all pieces between start and end (both not included)
        // Direction is valid because this function is called with a valid move
        const dir: HexaDirection = HexaDirection.factory.fromMove(start, end).get();
        for (let coord: Coord = start.getNext(dir); coord.equals(end) === false; coord = coord.getNext(dir)) {
            const piece: YinshPiece = newState.getPieceAt(coord);
            if (piece !== YinshPiece.EMPTY) {
                newState = newState.setAt(coord, piece.flip());
            }
        }
        return newState;
    }

    public override isLegal(move: YinshMove, state: YinshState): MGPFallible<YinshLegalityInformation> {
        if (move.isInitialPlacement()) {
            return this.initialPlacementValidity(state, move.start);
        }
        if (state.isInitialPlacementPhase()) {
            return MGPFallible.failure(YinshFailure.NO_MARKERS_IN_INITIAL_PHASE());
        }

        const initialCapturesValidity: MGPValidation = this.capturesValidity(state, move.initialCaptures);
        if (initialCapturesValidity.isFailure()) {
            return initialCapturesValidity.toOtherFallible();
        }
        const stateAfterInitialCaptures: YinshState = this.applyCaptures(move.initialCaptures, state);

        const moveValidity: MGPValidation =
            this.moveValidity(stateAfterInitialCaptures, move.start, move.end.get());
        if (moveValidity.isFailure()) {
            return moveValidity.toOtherFallible();
        }
        const stateAfterRingMove: YinshState =
            this.applyRingMoveAndFlip(move.start, move.end.get(), stateAfterInitialCaptures);

        const finalCapturesValidity: MGPValidation = this.capturesValidity(stateAfterRingMove, move.finalCaptures);
        if (finalCapturesValidity.isFailure()) {
            return finalCapturesValidity.toOtherFallible();
        }
        const stateAfterFinalCaptures: YinshState = this.applyCaptures(move.finalCaptures, stateAfterRingMove);

        const noMoreCapturesValidity: MGPValidation = this.noMoreCapturesValidity(stateAfterFinalCaptures);
        if (noMoreCapturesValidity.isFailure()) {
            return noMoreCapturesValidity.toOtherFallible();
        }

        return MGPFallible.success(stateAfterFinalCaptures);
    }

    public initialPlacementValidity(state: YinshState, coord: Coord): MGPFallible<YinshLegalityInformation> {
        if (state.isInitialPlacementPhase() === false) {
            return MGPFallible.failure(YinshFailure.PLACEMENT_AFTER_INITIAL_PHASE());
        }
        if (state.getPieceAt(coord) !== YinshPiece.EMPTY) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
        const player: Player = state.getCurrentPlayer();
        const sideRings: PlayerNumberMap = state.sideRings.getCopy();
        sideRings.add(player, -1);
        const newBoard: Table<YinshPiece> = state.setAt(coord, YinshPiece.of(player, true)).board;
        const newState: YinshState = new YinshState(newBoard, sideRings, state.turn);
        return MGPFallible.success(newState);
    }

    public moveStartValidity(state: YinshState, start: Coord): MGPValidation {
        const player: Player = state.getCurrentPlayer();
        // Start coord has to contain a ring of the current player
        if (state.getPieceAt(start) === YinshPiece.RINGS.get(player)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(YinshFailure.SHOULD_SELECT_PLAYER_RING());
        }
    }

    public moveValidity(state: YinshState, start: Coord, end: Coord): MGPValidation {
        const moveStartValidity: MGPValidation = this.moveStartValidity(state, start);
        if (moveStartValidity.isFailure()) {
            return moveStartValidity;
        }
        // End coord has to be empty
        if (state.getPieceAt(end) !== YinshPiece.EMPTY) {
            return MGPValidation.failure(YinshFailure.SHOULD_END_MOVE_ON_EMPTY_SPACE());
        }
        // There should only be markers or empty spaces between start and end
        // As soon as a marker group is passed, the move should stop on the first empty space
        // There cannot be rings between start and end
        const directionOptional: MGPFallible<HexaDirection> = HexaDirection.factory.fromMove(start, end);
        if (directionOptional.isFailure()) {
            return MGPValidation.failure(YinshFailure.MOVE_DIRECTION_INVALID());
        }
        const direction: HexaDirection = directionOptional.get();
        let markersPassed: boolean = false;
        for (let cur: Coord = start.getNext(direction); cur.equals(end) === false; cur = cur.getNext(direction)) {
            const piece: YinshPiece = state.getPieceAt(cur);
            if (piece === YinshPiece.EMPTY) {
                if (markersPassed) {
                    return MGPValidation.failure(YinshFailure.MOVE_SHOULD_END_AT_FIRST_EMPTY_SPACE_AFTER_MARKERS());
                }
            } else if (piece.isRing) {
                return MGPValidation.failure(YinshFailure.MOVE_SHOULD_NOT_PASS_ABOVE_RING());
            } else {
                // Piece is a marker
                markersPassed = true;
            }
        }
        return MGPValidation.SUCCESS;
    }

    private capturesValidity(state: YinshState, captures: ReadonlyArray<YinshCapture>)
    : MGPValidation
    {
        let updatedState: YinshState = state;
        for (const capture of captures) {
            const validity: MGPValidation = this.captureValidity(updatedState, capture);
            if (validity.isFailure()) {
                return validity;
            }
            updatedState = this.applyCapture(capture, updatedState);
        }
        return MGPValidation.SUCCESS;
    }

    public captureValidity(state: YinshState, capture: YinshCapture): MGPValidation {
        const player: Player = state.getCurrentPlayer();
        // There should be exactly 5 consecutive spaces, on the same line (invariants of YinshCapture)
        for (const coord of capture.capturedSpaces) {
            // The captured spaces must contain markers of the current player
            if (state.getPieceAt(coord) !== YinshPiece.MARKERS.get(player)) {
                return MGPValidation.failure(YinshFailure.CAN_ONLY_CAPTURE_YOUR_MARKERS());
            }
        }
        // The ring taken should be a ring
        if (state.getPieceAt(capture.ringTaken.get()) !== YinshPiece.RINGS.get(player)) {
            return MGPValidation.failure(YinshFailure.CAPTURE_SHOULD_TAKE_RING());
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
            return MGPValidation.failure(YinshFailure.MISSING_CAPTURES());
        }
    }

    private getLinePortionsWithAtLeastFivePiecesOfPlayer(state: YinshState, player: Player)
    : ReadonlyArray<{ start: Coord, end: Coord, dir: HexaDirection}>
    {
        const linePortions: { start: Coord, end: Coord, dir: HexaDirection}[] = [];
        state.allLines().forEach((line: HexaLine) => {
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
        const coord: Coord = state.getEntranceOnLine(line);
        const dir: HexaDirection = line.getDirection();
        let start: Coord = coord;
        let cur: Coord;
        for (cur = coord; state.isOnBoard(cur); cur = cur.getNext(dir)) {
            const piece: YinshPiece = state.getPieceAt(cur);
            if (piece.player === player && piece.isRing === false) {
                if (consecutives === 0) {
                    start = cur;
                }
                consecutives += 1;
            } else {
                if (5 <= consecutives) {
                    // There can only be one portion with at least 5 pieces, we found it
                    break;
                }
                consecutives = 0;
            }
        }
        if (5 <= consecutives) {
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
                    5 <= cur.getLinearDistanceToward(linePortion.end);
                    cur = cur.getNext(linePortion.dir)) {
                    captures.push(YinshCapture.of(cur, cur.getNext(linePortion.dir, 4)));
                }
            });
        return captures;
    }

    public getRingTargets(state: YinshState, start: Coord): Coord[] {
        const targets: Coord[] = [];
        for (const dir of HexaDirection.factory.all) {
            let pieceSeen: boolean = false;
            for (let cur: Coord = start.getNext(dir); state.isOnBoard(cur); cur = cur.getNext(dir)) {
                const piece: YinshPiece = state.getPieceAt(cur);
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

    public override getGameStatus(node: YinshNode): GameStatus {
        if (node.gameState.isInitialPlacementPhase()) {
            return GameStatus.ONGOING;
        }
        if (3 <= node.gameState.sideRings.get(Player.ZERO)) {
            return GameStatus.ZERO_WON;
        }
        if (3 <= node.gameState.sideRings.get(Player.ONE)) {
            return GameStatus.ONE_WON;
        }
        return GameStatus.ONGOING;
    }

}
