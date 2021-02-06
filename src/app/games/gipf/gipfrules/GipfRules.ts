import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/mgpnode/MGPNode';
import { Rules } from 'src/app/jscaip/Rules';
import { GipfPartSlice } from '../gipfpartslice/GipfPartSlice';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { GipfCapture, GipfLine, GipfMove, GipfPlacement } from '../gipfmove/GipfMove';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';
import { Table } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { GipfPiece } from '../gipfpiece/GipfPiece';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';
import { GipfLegalityStatus } from '../gipflegalitystatus/GipfLegalityStatus';

export class GipfNode extends MGPNode<GipfRules, GipfMove, GipfPartSlice, LegalityStatus> {}

export class GipfRules extends Rules<GipfMove, GipfPartSlice, GipfLegalityStatus> {
    public static VARIANT: 'basic' | 'standard' | 'tournament' = 'basic';

    public applyLegalMove(move: GipfMove, slice: GipfPartSlice, status: GipfLegalityStatus):
      { resultingMove: GipfMove; resultingSlice: GipfPartSlice; } {
        let sliceWithoutTurn: GipfPartSlice;
        if (status.computedSlice !== null) {
            sliceWithoutTurn = status.computedSlice;
        } else {
            const player: Player = slice.getCurrentPlayer();
            const sliceAfterInitialCapture: GipfPartSlice =
                this.applyCaptures(slice, move.initialCaptures, player);
            const sliceAfterPlacement: GipfPartSlice =
                this.applyPlacement(sliceAfterInitialCapture, move.placement, player);
            const sliceAfterFinalCapture: GipfPartSlice =
                this.applyCaptures(sliceAfterPlacement, move.finalCaptures, player);
            sliceWithoutTurn = sliceAfterFinalCapture;
        }
        return {
            resultingMove: move,
            resultingSlice: new GipfPartSlice(status.computedSlice.hexaBoard, sliceWithoutTurn.turn+1,
                                              sliceWithoutTurn.sidePieces, sliceWithoutTurn.canPlaceDouble,
                                              sliceWithoutTurn.capturedPieces),
        };
    }

    public getBoardValue(move: GipfMove, slice: GipfPartSlice): number {
        const score0: MGPOptional<number> = this.getPlayerScore(slice, Player.ZERO);
        const score1: MGPOptional<number> = this.getPlayerScore(slice, Player.ONE);
        if (score0.isAbsent()) {
            return Number.MAX_SAFE_INTEGER; // P1 wins
        } else if (score1.isAbsent()) {
            return Number.MIN_SAFE_INTEGER; // P0 wins
        } else {
            return score0.get() - score1.get();
        }
    }
    private getPlayerScore(slice: GipfPartSlice, player: Player): MGPOptional<number> {
        const piecesToPlay: number = slice.getNumberOfPiecesToPlace(player);
        if (piecesToPlay === 0) {
            // No more pieces to play, player loses
            return MGPOptional.empty();
        }
        const doublePieces: number = slice.getDoublePiecesOnBoard(player);
        const eachPlayerHasPlacedOnePiece: boolean = slice.turn > 1;
        if (eachPlayerHasPlacedOnePiece && doublePieces === 0) {
            // No more double pieces on board, player loses
            return MGPOptional.empty();
        }
        const captured: number = slice.getNumberOfPiecesCaptured(player);
        return MGPOptional.of(doublePieces * 10 + piecesToPlay + captured * 3);
    }

    public getListMoves(node: GipfNode): MGPMap<GipfMove, GipfPartSlice> {
        return this.getListMoveFromSlice(node.move, node.gamePartSlice);
    }
    private getListMoveFromSlice(move: GipfMove, slice: GipfPartSlice): MGPMap<GipfMove, GipfPartSlice> {
        const map: MGPMap<GipfMove, GipfPartSlice> = new MGPMap();

        if (this.isVictory(slice)) {
            return map;
        }

        const player: Player = slice.getCurrentPlayer();
        // TODO: make sure if there is no possible capture, that at least the empty capture list is returned
        this.getPossibleCaptureCombinations(slice, player).forEach((initialCaptures: ReadonlyArray<GipfCapture>) => {
            const sliceAfterCapture: GipfPartSlice = this.applyCaptures(slice, initialCaptures, player);
            this.getPlacements(sliceAfterCapture, player).forEach((placement: GipfPlacement) => {
                const sliceAfterPlacement: GipfPartSlice = this.applyPlacement(sliceAfterCapture, placement, player);
                this.getPossibleCaptureCombinations(sliceAfterPlacement, player)
                    .forEach((finalCaptures: ReadonlyArray<GipfCapture>) => {
                        // TODO: attach result of finalSlice to this.isLegal somehow?
                        const finalSlice: GipfPartSlice =
                            this.applyCaptures(sliceAfterPlacement, finalCaptures, player);
                        const moveSimple: GipfMove =
                            new GipfMove(placement, initialCaptures, finalCaptures);
                        map.set(moveSimple,
                                this.applyLegalMove(moveSimple, slice,
                                                    { legal: MGPValidation.SUCCESS, computedSlice: finalSlice })
                                    .resultingSlice);
                    });
            });
        });
        return map;
    }
    private isVictory(slice: GipfPartSlice): boolean {
        const player0Loses: boolean = this.getPlayerScore(slice, Player.ZERO).isAbsent();
        const player1Loses: boolean = this.getPlayerScore(slice, Player.ONE).isAbsent();
        return player0Loses || player1Loses;
    }
    private getPossibleCaptureCombinations(slice: GipfPartSlice, player: Player): Table<GipfCapture> {
        const captureCombinations: GipfCapture[][] = [];
        // Note: there can be at most one capture per line
        this.getLinePortionsWithFourPiecesOfPlayer(slice, player)
            .forEach((linePortion: [Coord, Coord, Direction]) => {
                const capturable: GipfCapture = this.getCapturable(slice, linePortion);
                const captures: Coord[][] = [];
                capturable.forEach((coord: Coord) => {
                    const newCaptures: Coord[][] = [];
                    captures.forEach((capture: Coord[]) => {
                        newCaptures.push([...capture, coord]);
                        if (slice.hexaBoard.getAt(coord).isDouble) {
                            // Double pieces may stay on the board
                            newCaptures.push(capture);
                        }
                    });
                });
            });
        return captureCombinations;
    }
    private getLinePortionsWithFourPiecesOfPlayer(slice: GipfPartSlice, player: Player):
    ReadonlyArray<[Coord, Coord, Direction]> {
        const linePortions: [Coord, Coord, Direction][] = [];
        GipfLine.allLines.forEach((line: GipfLine) => {
            const linePortion: MGPOptional<[Coord, Coord, Direction]> =
                this.getLinePortionWithFourPiecesOfPlayer(slice, player, line);
            if (linePortion.isPresent()) {
                linePortions.push(linePortion.get());
            }
        });
        return linePortions;
    }
    private getLinePortionWithFourPiecesOfPlayer(slice: GipfPartSlice, player: Player, line: GipfLine):
    MGPOptional<[Coord, Coord, Direction]> {
        let consecutives: number = 0;
        const coord: Coord = line.getEntrance();
        const dir: Direction = line.getDirection();
        let start: Coord = coord;
        for (let cur: Coord = coord; slice.hexaBoard.isOnBoard(coord); cur = cur.getNext(dir)) {
            if (slice.hexaBoard.getAt(coord).player === player) {
                if (consecutives === 0) {
                    start = cur;
                }
                consecutives += 1;
            } else {
                consecutives = 0;
            }
            if (consecutives === 4) {
                return MGPOptional.of([start, cur, dir]);
            }
        }
        return MGPOptional.empty();
    }
    private getCapturable(slice: GipfPartSlice, linePortion: [Coord, Coord, Direction]): GipfCapture {
        // Go into each direction and continue until there are pieces
        const capturable: Coord[] = [];
        const start: Coord = linePortion[0];
        const end: Coord = linePortion[1];
        const dir: Direction = linePortion[2];
        const oppositeDir: Direction = dir.getOpposite();
        for (let cur: Coord = start;
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
    private applyCaptures(slice: GipfPartSlice, captures: ReadonlyArray<GipfCapture>, playerCapturing: Player):
    GipfPartSlice {
        const board: HexaBoard<GipfPiece> = slice.hexaBoard;
        const sidePieces: [number, number] = slice.sidePieces;
        const capturedPieces: [number, number] = slice.capturedPieces;
        captures.forEach((capture: GipfCapture) => {
            capture.forEach((coord: Coord) => {
                const piece: GipfPiece = board.getAt(coord);
                board.setAt(coord, GipfPiece.EMPTY);
                if (piece.player === playerCapturing) {
                    sidePieces[playerCapturing.value] += 1;
                } else {
                    capturedPieces[playerCapturing.value] += 1;
                }
            });
        });
        return new GipfPartSlice(board, slice.turn, sidePieces, slice.canPlaceDouble, capturedPieces);
    }

    private getPlacements(slice: GipfPartSlice, player: Player): GipfPlacement[] {
        const placements: GipfPlacement[] = [];
        slice.hexaBoard.getAllBorders().forEach((entrance: Coord) => {
            this.getAllDirectionsForEntrance(slice, entrance).forEach((dir: Direction) => {
                if (this.isLineComplete(slice, entrance, dir) === false) {
                    placements.push(new GipfPlacement(entrance, dir, false));
                    if (slice.playerCanStillPlaceDouble(player)) {
                        placements.push(new GipfPlacement(entrance, dir, false));
                    }
                }
            });
        });
        return placements;
    }
    private isLineComplete(slice: GipfPartSlice, start: Coord, dir: Direction): boolean {
        return this.nextGapInLine(slice, start, dir).isAbsent();
    }
    private nextGapInLine(slice: GipfPartSlice, start: Coord, dir: Direction): MGPOptional<Coord> {
        for (let cur: Coord = start; slice.hexaBoard.isOnBoard(cur); cur = cur.getNext(dir)) {
            if (slice.hexaBoard.getAt(cur) === GipfPiece.EMPTY) {
                return MGPOptional.of(cur);
            }
        }
        return MGPOptional.empty();
    }
    private applyPlacement(slice: GipfPartSlice, placement: GipfPlacement, player: Player): GipfPartSlice {
        let board: HexaBoard<GipfPiece> = slice.hexaBoard;
        let prevPiece: GipfPiece = GipfPiece.EMPTY;
        for (let cur: Coord = placement.coord;
            board.isOnBoard(cur) && board.getAt(cur) !== GipfPiece.EMPTY;
            cur = cur.getNext(placement.direction)) {
            const curPiece: GipfPiece = board.getAt(cur);
            board = board.setAt(cur, prevPiece);
            prevPiece = curPiece;
        }
        const sidePieces: [number, number] = [slice.sidePieces[0], slice.sidePieces[1]];
        sidePieces[player.value] -= 1;
        const canPlaceDouble: [boolean, boolean] = [slice.canPlaceDouble[0], slice.canPlaceDouble[1]];
        if (placement.isDouble === false) {
            canPlaceDouble[player.value] = false;
        }
        return new GipfPartSlice(board, slice.turn, sidePieces, canPlaceDouble, slice.capturedPieces);
    }

    private getAllDirectionsForEntrance(slice: GipfPartSlice, entrance: Coord): Direction[] {
        // TODO: How to clean this?
        if (slice.hexaBoard.isTopLeftCorner(entrance)) {
            return [HexaDirection.DOWN_RIGHT, HexaDirection.DOWN, HexaDirection.UP_RIGHT];
        } else if (slice.hexaBoard.isTopCorner(entrance)) {
            return [HexaDirection.DOWN, HexaDirection.DOWN_LEFT, HexaDirection.DOWN_RIGHT];
        } else if (slice.hexaBoard.isTopRightCorner(entrance)) {
            return [HexaDirection.DOWN_LEFT, HexaDirection.DOWN, HexaDirection.UP_LEFT];
        } else if (slice.hexaBoard.isBottomLeftCorner(entrance)) {
            return [HexaDirection.UP_RIGHT, HexaDirection.UP, HexaDirection.DOWN_RIGHT];
        } else if (slice.hexaBoard.isBottomCorner(entrance)) {
            return [HexaDirection.UP, HexaDirection.UP_LEFT, HexaDirection.UP_RIGHT];
        } else if (slice.hexaBoard.isBottomRightCorner(entrance)) {
            return [HexaDirection.UP_LEFT, HexaDirection.UP, HexaDirection.DOWN_LEFT];
        } else if (slice.hexaBoard.isOnTopLeftBorder(entrance)) {
            return [HexaDirection.DOWN_RIGHT, HexaDirection.DOWN];
        } else if (slice.hexaBoard.isOnLeftBorder(entrance)) {
            return [HexaDirection.UP_RIGHT, HexaDirection.UP_LEFT];
        } else if (slice.hexaBoard.isOnBottomLeftBorder(entrance)) {
            return [HexaDirection.UP, HexaDirection.UP_RIGHT];
        } else if (slice.hexaBoard.isOnBottomRightBorder(entrance)) {
            return [HexaDirection.UP_LEFT, HexaDirection.UP_RIGHT];
        } else if (slice.hexaBoard.isOnRightBorder(entrance)) {
            return [HexaDirection.UP_LEFT, HexaDirection.DOWN_LEFT];
        } else if (slice.hexaBoard.isOnTopRightBorder(entrance)) {
            return [HexaDirection.DOWN_LEFT, HexaDirection.DOWN];
        } else {
            throw new Error('not a border');
        }
    }

    public isLegal(move: GipfMove, slice: GipfPartSlice): GipfLegalityStatus {
        const player: Player = slice.getCurrentPlayer();

        const initialCapturesValidity: MGPValidation = this.capturesValidity(slice, move.initialCaptures, player);
        if (initialCapturesValidity.isFailure()) {
            return { legal: initialCapturesValidity };
        }
        const sliceAfterInitialCaptures: GipfPartSlice = this.applyCaptures(slice, move.initialCaptures, player);

        const noMoreCaptureAfterInitialValidity: MGPValidation = this.noMoreCapturesValidity(slice, player);
        if (noMoreCaptureAfterInitialValidity.isFailure()) {
            return { legal: noMoreCaptureAfterInitialValidity };
        }

        const placementValidity: MGPValidation =
            this.placementValidity(sliceAfterInitialCaptures, move.placement, player);
        if (placementValidity.isFailure()) {
            return { legal: placementValidity };
        }
        const sliceAfterPlacement: GipfPartSlice =
            this.applyPlacement(sliceAfterInitialCaptures, move.placement, player);

        const finalCapturesValidity: MGPValidation =
            this.capturesValidity(sliceAfterPlacement, move.finalCaptures, player);
        if (finalCapturesValidity.isFailure()) {
            return { legal: finalCapturesValidity };
        }
        const sliceAfterFinalCaptures: GipfPartSlice =
            this.applyCaptures(sliceAfterPlacement, move.finalCaptures, player);

        return { legal: MGPValidation.SUCCESS, computedSlice: sliceAfterFinalCaptures };
    }
    private capturesValidity(slice: GipfPartSlice, captures: ReadonlyArray<GipfCapture>, player: Player):
    MGPValidation {
        captures.forEach((capture: GipfCapture) => {
            const validity: MGPValidation = this.captureValidity(slice, capture, player);
            if (validity.isFailure()) {
                return validity;
            }
        });
        return MGPValidation.SUCCESS;
    }
    private captureValidity(slice: GipfPartSlice, capture: GipfCapture, player: Player): MGPValidation {
        const linePortionOpt: MGPOptional<[Coord, Coord, Direction]> =
            this.getLinePortionWithFourPiecesOfPlayer(slice, player, capture.getLine());
        if (linePortionOpt.isAbsent()) {
            return MGPValidation.failure(
                'Une capture ne peut que se faire si 4 pièces de votre couleurs sont alignées');
        }

        const linePortion: [Coord, Coord, Direction] = linePortionOpt.get();

        const capturable: GipfCapture = this.getCapturable(slice, linePortion);
        capturable.forEach((coord: Coord) => {
            const isDouble: boolean = slice.hexaBoard.getAt(coord).isDouble;
            if (isDouble == false) {
                if (capture.contains(coord) === false) {
                    return MGPValidation.failure('Vous devez capturer toutes les pièces simples de la ligne');
                }
            }
        });

        capture.forEach((coord: Coord) => {
            if (capturable.contains(coord) === false) {
                return MGPValidation.failure('Un des emplacements capturé n\'est pas capturable');
            }
        });

        return MGPValidation.SUCCESS;
    }
    private noMoreCapturesValidity(slice: GipfPartSlice, player: Player): MGPValidation {
        const linePortions: ReadonlyArray<[Coord, Coord, Direction]> =
            this.getLinePortionsWithFourPiecesOfPlayer(slice, player);
        if (linePortions.length === 0) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Toutes les captures nécessaires n\'ont pas été effectuées');
        }
    }

    private placementValidity(slice: GipfPartSlice, placement: GipfPlacement, player: Player): MGPValidation {
        if (slice.hexaBoard.isOnBoard(placement.coord) === false) {
            return MGPValidation.failure('Une pièce doit être placée sur le plateau de jeu');
        }
        if (slice.hexaBoard.isOnBorder(placement.coord) === false) {
            return MGPValidation.failure('Une pièce doit être placée sur le bord du plateau de jeu');
        }
        if (this.isLineComplete(slice, placement.coord, placement.direction)) {
            return MGPValidation.failure('Une pièce ne peut pas être placée sur une ligne complète');
        }
        for (const dir of this.getAllDirectionsForEntrance(slice, placement.coord)) {
            if (dir === placement.direction) {
                return MGPValidation.SUCCESS;
            }
        }
        return MGPValidation.failure('La direction du placement n\'est pas valide');
    }
}
