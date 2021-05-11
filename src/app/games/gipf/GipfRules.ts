import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexaLine } from 'src/app/jscaip/HexaLine';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { GipfCapture, GipfMove, GipfPlacement } from './GipfMove';
import { GipfPartSlice } from './GipfPartSlice';
import { GipfLegalityStatus } from './GipfLegalityStatus';
import { GipfPiece } from './GipfPiece';
import { GipfBoard } from './GipfBoard';
import { GipfFailure } from './GipfFailure';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';

export class GipfNode extends MGPNode<GipfRules, GipfMove, GipfPartSlice> {}

export class GipfMinimax extends Minimax<GipfMove, GipfPartSlice, GipfLegalityStatus> {

    public getBoardValue(move: GipfMove, slice: GipfPartSlice): NodeUnheritance {
        const score0: MGPOptional<number> = GipfRules.getPlayerScore(slice, Player.ZERO);
        const score1: MGPOptional<number> = GipfRules.getPlayerScore(slice, Player.ONE);
        if (score0.isAbsent()) {
            return new NodeUnheritance(Player.ONE.getVictoryValue());
        } else if (score1.isAbsent()) {
            return new NodeUnheritance(Player.ZERO.getVictoryValue());
        } else {
            return new NodeUnheritance(score0.get() - score1.get());
        }
    }
    public getListMoves(node: GipfNode): GipfMove[] {
        return this.getListMoveFromSlice(node.gamePartSlice);
    }
    private getListMoveFromSlice(slice: GipfPartSlice): GipfMove[] {
        const moves: GipfMove[] = [];

        if (GipfRules.isGameOver(slice)) {
            return moves;
        }

        this.getPossibleCaptureCombinations(slice).forEach((initialCaptures: ReadonlyArray<GipfCapture>) => {
            const sliceAfterCapture: GipfPartSlice = GipfRules.applyCaptures(slice, initialCaptures);
            GipfRules.getPlacements(sliceAfterCapture).forEach((placement: GipfPlacement) => {
                const sliceAfterPlacement: GipfPartSlice = GipfRules.applyPlacement(sliceAfterCapture, placement);
                this.getPossibleCaptureCombinations(sliceAfterPlacement)
                    .forEach((finalCaptures: ReadonlyArray<GipfCapture>) => {
                        const moveSimple: GipfMove =
                            new GipfMove(placement, initialCaptures, finalCaptures);
                        moves.push(moveSimple);
                    });
            });
        });
        return moves;
    }
    private getPossibleCaptureCombinations(slice: GipfPartSlice): Table<GipfCapture> {
        const possibleCaptures: GipfCapture[] = GipfRules.getPossibleCaptures(slice);
        const intersections: number[][] = this.computeIntersections(possibleCaptures);
        let captureCombinations: number[][] = [[]];
        possibleCaptures.forEach((_capture: GipfCapture, index: number) => {
            if (intersections[index].length === 0) {
                // Capture is part of no intersection, we can safely add it to all combinations
                captureCombinations.forEach((combination: number[]) => {
                    combination.push(index);
                });
            } else {
                // Capture is part of intersections. Add it everywhere we can
                // But if it is conflicting with some future index, duplicate when we add it
                const newCombinations: number[][] = [];
                const intersectsWithFutureIndex: boolean = intersections[index].some((c: number) => c > index);
                for (const combination of captureCombinations) {

                    const combinationIntersectsWithIndex: boolean =
                        combination.some((c: number) => intersections[index].some((c2: number) => c === c2));
                    if (combinationIntersectsWithIndex === true) {
                        // Don't add it if there is an intersection
                        newCombinations.push(ArrayUtils.copyImmutableArray(combination));
                    } else if (intersectsWithFutureIndex) {
                        // duplicate before adding index to a combination where there is no intersection
                        newCombinations.push(ArrayUtils.copyImmutableArray(combination));
                        combination.push(index);
                        newCombinations.push(ArrayUtils.copyImmutableArray(combination));
                    } else {
                        // No intersection whatsoever, add the capture
                        combination.push(index);
                        newCombinations.push(ArrayUtils.copyImmutableArray(combination));
                    }
                }
                captureCombinations = newCombinations;
            }
        });
        return captureCombinations.map((combination: number[]) => {
            return combination.map((index: number) => {
                return possibleCaptures[index];
            });
        });
    }
    private computeIntersections(captures: GipfCapture[]): number[][] {
        const intersections: number[][] = [];
        captures.forEach((capture1: GipfCapture, index1: number) => {
            intersections.push([]);
            captures.forEach((capture2: GipfCapture, index2: number) => {
                if (index1 !== index2) {
                    if (capture1.intersectsWith(capture2)) {
                        intersections[index1].push(index2);
                    }
                }
            });
        });
        return intersections;
    }
}

export class GipfRules extends Rules<GipfMove, GipfPartSlice, GipfLegalityStatus> {

    public applyLegalMove(move: GipfMove, slice: GipfPartSlice, status: GipfLegalityStatus): GipfPartSlice {
        let sliceWithoutTurn: GipfPartSlice;
        if (status.computedSlice !== null) {
            sliceWithoutTurn = status.computedSlice;
        } else {
            const sliceAfterInitialCapture: GipfPartSlice =
                GipfRules.applyCaptures(slice, move.initialCaptures);
            const sliceAfterPlacement: GipfPartSlice =
                GipfRules.applyPlacement(sliceAfterInitialCapture, move.placement);
            const sliceAfterFinalCapture: GipfPartSlice =
                GipfRules.applyCaptures(sliceAfterPlacement, move.finalCaptures);
            sliceWithoutTurn = sliceAfterFinalCapture;
        }
        return new GipfPartSlice(sliceWithoutTurn.hexaBoard, sliceWithoutTurn.turn+1,
                                 sliceWithoutTurn.sidePieces, sliceWithoutTurn.capturedPieces);
    }
    public static applyCaptures(slice: GipfPartSlice, captures: ReadonlyArray<GipfCapture>)
    : GipfPartSlice
    {
        let computedSlice: GipfPartSlice = slice;
        captures.forEach((capture: GipfCapture) => {
            computedSlice = GipfRules.applyCapture(computedSlice, capture);
        });
        return computedSlice;
    }
    public static applyCapture(slice: GipfPartSlice, capture: GipfCapture): GipfPartSlice {
        const player: Player = slice.getCurrentPlayer();
        let board: GipfBoard = slice.hexaBoard;
        const sidePieces: [number, number] = [slice.sidePieces[0], slice.sidePieces[1]];
        const capturedPieces: [number, number] = [slice.capturedPieces[0], slice.capturedPieces[1]];
        capture.forEach((coord: Coord) => {
            const piece: GipfPiece = board.getAt(coord);
            board = board.setAt(coord, GipfPiece.EMPTY);
            if (piece.player === player) {
                sidePieces[player.value] += 1;
            } else {
                capturedPieces[player.value] += 1;
            }
        });
        return new GipfPartSlice(board, slice.turn, sidePieces, capturedPieces);
    }
    public static getPlacements(slice: GipfPartSlice): GipfPlacement[] {
        const placements: GipfPlacement[] = [];
        FlatHexaOrientation.INSTANCE.getAllBorders(slice.hexaBoard).forEach((entrance: Coord) => {
            if (slice.hexaBoard.getAt(entrance) === GipfPiece.EMPTY) {
                placements.push(new GipfPlacement(entrance, MGPOptional.empty()));
            } else {
                GipfRules.getAllDirectionsForEntrance(slice, entrance).forEach((dir: HexaDirection) => {
                    if (GipfRules.isLineComplete(slice, entrance, dir) === false) {
                        placements.push(new GipfPlacement(entrance, MGPOptional.of(dir)));
                    }
                });
            }
        });
        return placements;
    }
    public static isLineComplete(slice: GipfPartSlice, start: Coord, dir: HexaDirection): boolean {
        return GipfRules.nextGapInLine(slice, start, dir).isAbsent();
    }
    private static nextGapInLine(slice: GipfPartSlice, start: Coord, dir: HexaDirection): MGPOptional<Coord> {
        for (let cur: Coord = start; slice.hexaBoard.isOnBoard(cur); cur = cur.getNext(dir)) {
            if (slice.hexaBoard.getAt(cur) === GipfPiece.EMPTY) {
                return MGPOptional.of(cur);
            }
        }
        return MGPOptional.empty();
    }
    public static applyPlacement(slice: GipfPartSlice, placement: GipfPlacement): GipfPartSlice {
        const player: Player = slice.getCurrentPlayer();
        let board: GipfBoard = slice.hexaBoard;
        let prevPiece: GipfPiece = GipfPiece.ofPlayer(slice.getCurrentPlayer());
        if (placement.direction.isAbsent()) {
            // Only valid if there is an empty spot
            const coord: Coord = placement.coord;
            if (board.getAt(coord) !== GipfPiece.EMPTY) {
                throw new Error('Apply placement called without direction while the coord is occupied');
            }
            board = board.setAt(coord, prevPiece);
        } else {
            for (let cur: Coord = placement.coord;
                board.isOnBoard(cur) && prevPiece !== GipfPiece.EMPTY;
                cur = cur.getNext(placement.direction.get())) {
                const curPiece: GipfPiece = board.getAt(cur);
                board = board.setAt(cur, prevPiece);
                prevPiece = curPiece;
            }
        }
        const sidePieces: [number, number] = [slice.sidePieces[0], slice.sidePieces[1]];
        sidePieces[player.value] -= 1;
        return new GipfPartSlice(board, slice.turn, sidePieces, slice.capturedPieces);
    }
    public getPiecesMoved(slice: GipfPartSlice,
                          initialCaptures: ReadonlyArray<GipfCapture>,
                          placement: GipfPlacement): Coord[] {
        const sliceAfterCapture: GipfPartSlice = GipfRules.applyCaptures(slice, initialCaptures);
        if (placement.direction.isAbsent()) {
            return [placement.coord];
        } else {
            const dir: HexaDirection = placement.direction.get();
            const moved: Coord[] = [];
            moved.push(placement.coord);
            let cur: Coord = placement.coord.getNext(dir);
            while (sliceAfterCapture.hexaBoard.isOnBoard(cur) &&
                sliceAfterCapture.hexaBoard.getAt(cur) !== GipfPiece.EMPTY) {
                moved.push(cur);
                cur = cur.getNext(dir);
            }
            assert(sliceAfterCapture.hexaBoard.isOnBoard(cur) &&
                sliceAfterCapture.hexaBoard.getAt(cur) === GipfPiece.EMPTY,
                   'getPiecesMoved called with an invalid placement performed on a full line');
            // This is the case filled by the last pushed piece
            moved.push(cur);
            return moved;
        }
    }
    public static getAllDirectionsForEntrance(slice: GipfPartSlice, entrance: Coord): HexaDirection[] {
        if (FlatHexaOrientation.INSTANCE.isTopLeftCorner(slice.hexaBoard, entrance)) {
            return [HexaDirection.DOWN_RIGHT, HexaDirection.DOWN, HexaDirection.UP_RIGHT];
        } else if (FlatHexaOrientation.INSTANCE.isTopCorner(slice.hexaBoard, entrance)) {
            return [HexaDirection.DOWN, HexaDirection.DOWN_LEFT, HexaDirection.DOWN_RIGHT];
        } else if (FlatHexaOrientation.INSTANCE.isTopRightCorner(slice.hexaBoard, entrance)) {
            return [HexaDirection.DOWN_LEFT, HexaDirection.DOWN, HexaDirection.UP_LEFT];
        } else if (FlatHexaOrientation.INSTANCE.isBottomLeftCorner(slice.hexaBoard, entrance)) {
            return [HexaDirection.UP_RIGHT, HexaDirection.UP, HexaDirection.DOWN_RIGHT];
        } else if (FlatHexaOrientation.INSTANCE.isBottomCorner(slice.hexaBoard, entrance)) {
            return [HexaDirection.UP, HexaDirection.UP_LEFT, HexaDirection.UP_RIGHT];
        } else if (FlatHexaOrientation.INSTANCE.isBottomRightCorner(slice.hexaBoard, entrance)) {
            return [HexaDirection.UP_LEFT, HexaDirection.UP, HexaDirection.DOWN_LEFT];
        } else if (FlatHexaOrientation.INSTANCE.isOnTopLeftBorder(slice.hexaBoard, entrance)) {
            return [HexaDirection.DOWN_RIGHT, HexaDirection.DOWN];
        } else if (FlatHexaOrientation.INSTANCE.isOnLeftBorder(slice.hexaBoard, entrance)) {
            return [HexaDirection.UP_RIGHT, HexaDirection.DOWN_RIGHT];
        } else if (FlatHexaOrientation.INSTANCE.isOnBottomLeftBorder(slice.hexaBoard, entrance)) {
            return [HexaDirection.UP, HexaDirection.UP_RIGHT];
        } else if (FlatHexaOrientation.INSTANCE.isOnBottomRightBorder(slice.hexaBoard, entrance)) {
            return [HexaDirection.UP_LEFT, HexaDirection.UP];
        } else if (FlatHexaOrientation.INSTANCE.isOnRightBorder(slice.hexaBoard, entrance)) {
            return [HexaDirection.UP_LEFT, HexaDirection.DOWN_LEFT];
        } else if (FlatHexaOrientation.INSTANCE.isOnTopRightBorder(slice.hexaBoard, entrance)) {
            return [HexaDirection.DOWN_LEFT, HexaDirection.DOWN];
        } else {
            throw new Error('not a border');
        }
    }
    public isLegal(move: GipfMove, slice: GipfPartSlice): GipfLegalityStatus {
        const initialCapturesValidity: MGPValidation = this.capturesValidity(slice, move.initialCaptures);
        if (initialCapturesValidity.isFailure()) {
            return { legal: initialCapturesValidity };
        }
        const sliceAfterInitialCaptures: GipfPartSlice = GipfRules.applyCaptures(slice, move.initialCaptures);

        const noMoreCaptureAfterInitialValidity: MGPValidation = this.noMoreCapturesValidity(sliceAfterInitialCaptures);
        if (noMoreCaptureAfterInitialValidity.isFailure()) {
            return { legal: noMoreCaptureAfterInitialValidity };
        }

        const placementValidity: MGPValidation =
            this.placementValidity(sliceAfterInitialCaptures, move.placement);
        if (placementValidity.isFailure()) {
            return { legal: placementValidity };
        }
        const sliceAfterPlacement: GipfPartSlice =
            GipfRules.applyPlacement(sliceAfterInitialCaptures, move.placement);

        const finalCapturesValidity: MGPValidation =
            this.capturesValidity(sliceAfterPlacement, move.finalCaptures);
        if (finalCapturesValidity.isFailure()) {
            return { legal: finalCapturesValidity };
        }

        const sliceAfterFinalCaptures: GipfPartSlice =
            GipfRules.applyCaptures(sliceAfterPlacement, move.finalCaptures);
        const noMoreCaptureAfterFinalValidity: MGPValidation =
            this.noMoreCapturesValidity(sliceAfterFinalCaptures);
        if (noMoreCaptureAfterFinalValidity.isFailure()) {
            return { legal: noMoreCaptureAfterFinalValidity };
        }

        return { legal: MGPValidation.SUCCESS, computedSlice: sliceAfterFinalCaptures };
    }
    private capturesValidity(slice: GipfPartSlice, captures: ReadonlyArray<GipfCapture>):
    MGPValidation {
        let updatedSlice: GipfPartSlice = slice;
        for (const capture of captures) {
            const validity: MGPValidation = this.captureValidity(updatedSlice, capture);
            if (validity.isFailure()) {
                return validity;
            }
            updatedSlice = GipfRules.applyCapture(updatedSlice, capture);
        }
        return MGPValidation.SUCCESS;
    }
    public captureValidity(slice: GipfPartSlice, capture: GipfCapture): MGPValidation {
        const player: Player = slice.getCurrentPlayer();
        const linePortionOpt: MGPOptional<{ 0: Coord, 1: Coord, 2: HexaDirection}> =
            GipfRules.getLinePortionWithFourPiecesOfPlayer(slice, player, capture.getLine());
        if (linePortionOpt.isAbsent()) {
            return MGPValidation.failure(GipfFailure.CAPTURE_MUST_BE_ALIGNED);
        }

        const linePortion: { 0: Coord, 1: Coord, 2: HexaDirection} = linePortionOpt.get();

        const capturable: GipfCapture = GipfRules.getCapturable(slice, linePortion);
        if (capturable.equals(capture)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(GipfFailure.INVALID_CAPTURED_PIECES);
        }
    }
    public static getLinePortionsWithFourPiecesOfPlayer(slice: GipfPartSlice, player: Player):
    ReadonlyArray<{ 0: Coord, 1: Coord, 2: HexaDirection}> {
        const linePortions: { 0: Coord, 1: Coord, 2: HexaDirection}[] = [];
        slice.hexaBoard.allLines().forEach((line: HexaLine) => {
            const linePortion: MGPOptional<{ 0: Coord, 1: Coord, 2: HexaDirection}> =
                GipfRules.getLinePortionWithFourPiecesOfPlayer(slice, player, line);
            if (linePortion.isPresent()) {
                linePortions.push(linePortion.get());
            }
        });
        return linePortions;
    }
    public static getLinePortionWithFourPiecesOfPlayer(slice: GipfPartSlice, player: Player, line: HexaLine)
    : MGPOptional<{ 0: Coord, 1: Coord, 2: HexaDirection}>
    {
        let consecutives: number = 0;
        const coord: Coord = line.getEntrance(slice.hexaBoard);
        const dir: HexaDirection = line.getDirection();
        let start: Coord = coord;
        for (let cur: Coord = coord; slice.hexaBoard.isOnBoard(cur); cur = cur.getNext(dir)) {
            if (slice.hexaBoard.getAt(cur).player === player) {
                if (consecutives === 0) {
                    start = cur;
                }
                consecutives += 1;
            } else {
                consecutives = 0;
            }
            if (consecutives === 4) {
                return MGPOptional.of({ 0: start, 1: cur, 2: dir });
            }
        }
        return MGPOptional.empty();
    }
    private noMoreCapturesValidity(slice: GipfPartSlice): MGPValidation {
        const player: Player = slice.getCurrentPlayer();
        const linePortions: ReadonlyArray<{ 0: Coord, 1: Coord, 2: HexaDirection}> =
            GipfRules.getLinePortionsWithFourPiecesOfPlayer(slice, player);
        if (linePortions.length === 0) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(GipfFailure.MISSING_CAPTURES);
        }
    }
    public placementValidity(slice: GipfPartSlice, placement: GipfPlacement): MGPValidation {
        const coordValidity: MGPValidation = this.placementCoordValidity(slice, placement.coord);
        if (coordValidity.isFailure()) {
            return coordValidity;
        }
        if (slice.hexaBoard.getAt(placement.coord) !== GipfPiece.EMPTY) {
            if (placement.direction.isAbsent()) {
                return MGPValidation.failure(GipfFailure.PLACEMENT_WITHOUT_DIRECTION);
            }
            if (GipfRules.isLineComplete(slice, placement.coord, placement.direction.get())) {
                return MGPValidation.failure(GipfFailure.PLACEMENT_ON_COMPLETE_LINE);
            }
            for (const dir of GipfRules.getAllDirectionsForEntrance(slice, placement.coord)) {
                if (dir === placement.direction.get()) {
                    return MGPValidation.SUCCESS;
                }
            }
            return MGPValidation.failure(GipfFailure.INVALID_PLACEMENT_DIRECTION);
        }
        return MGPValidation.SUCCESS;
    }
    public placementCoordValidity(slice: GipfPartSlice, coord: Coord): MGPValidation {
        if (FlatHexaOrientation.INSTANCE.isOnBorder(slice.hexaBoard, coord)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(GipfFailure.PLACEMENT_NOT_ON_BORDER);
        }
    }
    public static getCapturable(slice: GipfPartSlice,
                                linePortion: { 0: Coord, 1: Coord, 2: HexaDirection})
    : GipfCapture
    {
        // Go into each direction and continue until there are pieces
        const capturable: Coord[] = [];
        const start: Coord = linePortion[0];
        const end: Coord = linePortion[1];
        const dir: HexaDirection = linePortion[2];
        const oppositeDir: HexaDirection = dir.getOpposite();
        for (let cur: Coord = start.getNext(oppositeDir);
            slice.hexaBoard.isOnBoard(cur) && slice.hexaBoard.getAt(cur) !== GipfPiece.EMPTY;
            cur = cur.getNext(oppositeDir)) {
            // Go backwards to identify capturable pieces before the 4 aligned pieces
            capturable.push(cur);
        }
        for (let cur: Coord = start; !cur.equals(end); cur = cur.getNext(dir)) {
            // The 4 pieces are capturable
            capturable.push(cur);
        }
        for (let cur: Coord = end;
            slice.hexaBoard.isOnBoard(cur) && slice.hexaBoard.getAt(cur) !== GipfPiece.EMPTY;
            cur = cur.getNext(dir)) {
            // Go forward to identify capturable pieces after the 4 aligned pieces
            capturable.push(cur);
        }
        return new GipfCapture(capturable);
    }
    public static getPossibleCaptures(slice: GipfPartSlice): GipfCapture[] {
        const player: Player = slice.getCurrentPlayer();
        const captures: GipfCapture[] = [];
        GipfRules.getLinePortionsWithFourPiecesOfPlayer(slice, player)
            .forEach((linePortion: { 0: Coord, 1: Coord, 2: HexaDirection}) => {
                captures.push(GipfRules.getCapturable(slice, linePortion));
            });
        return captures;
    }
    public static getPlayerScore(slice: GipfPartSlice, player: Player): MGPOptional<number> {
        const piecesToPlay: number = slice.getNumberOfPiecesToPlace(player);
        if (piecesToPlay === 0) {
            const captures: GipfCapture[] = GipfRules.getPossibleCaptures(slice);
            if (captures.length === 0) {
                // No more pieces to play and no possible capture, player loses
                return MGPOptional.empty();
            }
        }
        const captured: number = slice.getNumberOfPiecesCaptured(player);
        return MGPOptional.of(piecesToPlay + captured * 3);
    }
    public static isGameOver(state: GipfPartSlice): boolean {
        const score0: MGPOptional<number> = GipfRules.getPlayerScore(state, Player.ZERO);
        const score1: MGPOptional<number> = GipfRules.getPlayerScore(state, Player.ONE);
        return score0.isAbsent() ||
               score1.isAbsent();
    }
    public isGameOver(state: GipfPartSlice): boolean {
        return GipfRules.isGameOver(state);
    }
}
