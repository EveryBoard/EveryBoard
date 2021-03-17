import { Coord } from 'src/app/jscaip/coord/Coord';
import { TriangularGameState } from 'src/app/jscaip/game-state/triangular-game-state/TriangularGameState';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Rules } from 'src/app/jscaip/Rules';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { CoerceoMove } from '../coerceo-move/CoerceoMove';
import { CoerceoPartSlice, CoerceoPiece } from '../coerceo-part-slice/CoerceoPartSlice';

/* eslint-disable max-len */
export class CoerceoFailure {

    public static INVALID_DISTANCE: string = 'Distance de déplacement illégal, votre pion doit atterir sur l\'un des six triangles de même couleur les plus proches';

    public static CANNOT_LAND_ON_ALLY: string = 'Vous ne pouvez pas déplacer vos pièces sur vos propres pièces.';

    public static MUST_CHOOSE_OWN_PIECE_NOT_EMPTY: string = 'vous avez sélectionné une case vide, vous devez sélectionner l\'une de vos pièces.'
}

abstract class CoerceoNode extends MGPNode<CoerceoRules, CoerceoMove, CoerceoPartSlice, LegalityStatus> {}

export class CoerceoRules extends Rules<CoerceoMove, CoerceoPartSlice, LegalityStatus> {
    public getListMoves(node: CoerceoNode): MGPMap<CoerceoMove, CoerceoPartSlice> {
        throw new Error('Method not implemented.');
    }
    public getBoardValue(move: CoerceoMove, slice: CoerceoPartSlice): number {
        throw new Error('Method not implemented.');
    }
    public applyLegalMove(move: CoerceoMove, slice: CoerceoPartSlice, status: LegalityStatus): { resultingMove: CoerceoMove, resultingSlice: CoerceoPartSlice; } {
        if (move.isTileExchange()) {
            return this.applyLegalTileExchange(move, slice, status);
        } else {
            return this.applyLegalDeplacement(move, slice, status);
        }
    }
    public applyLegalTileExchange(move: CoerceoMove, slice: CoerceoPartSlice, status: LegalityStatus): { resultingMove: CoerceoMove, resultingSlice: CoerceoPartSlice; } {
        throw new Error('Method not implemented.');
    }
    public applyLegalDeplacement(move: CoerceoMove,
                                 slice: CoerceoPartSlice,
                                 status: LegalityStatus): { resultingMove: CoerceoMove, resultingSlice: CoerceoPartSlice; }
    {
        // Move the piece
        const afterMoveSlice: CoerceoPartSlice = slice.applyLegalDeplacement(move);
        // removes emptied tiles
        const afterTilesRemovedSlice: CoerceoPartSlice = this.removeTiles(move, afterMoveSlice);
        // removes captured pieces
        const afterCapturesSlice: CoerceoPartSlice = this.doDeplacementCaptures(move, afterTilesRemovedSlice);
        const resultingSlice: CoerceoPartSlice = new CoerceoPartSlice(afterCapturesSlice.board,
                                                                      slice.turn + 1,
                                                                      afterMoveSlice.tiles,
                                                                      afterCapturesSlice.captures);
        return { resultingMove: move, resultingSlice };
    }
    public removeTiles(move: CoerceoMove, slice: CoerceoPartSlice): CoerceoPartSlice {
        const start: Coord = move.start.get();
        const leftTiles: Coord = slice.getTilesCoord(start);
        if (slice.isTilesEmpty(leftTiles)) {
            if (slice.isDeconnectable(leftTiles)) {
                throw new Error('tamère ladev');
            }
        } else {
            return slice;
        }
    }
    public doDeplacementCaptures(move: CoerceoMove, slice: CoerceoPartSlice): CoerceoPartSlice {
        const newBoard: number[][] = slice.getCopiedBoard();
        let newCaptureZero: number = slice.captures.zero;
        let newCaptureOne: number = slice.captures.one;
        const threatenedCoords: Coord[] = TriangularCheckerBoard.getNeighboors(move.landingCoord.get());
        for (const threatened of threatenedCoords) {
            const remainingFreedom: Coord[] =
                TriangularGameState.getEmptyNeighboors(newBoard, threatened, CoerceoPiece.EMPTY.value);
            console.log('neighboor', threatened, 'has', remainingFreedom.length);
            if (remainingFreedom.length === 0) {
                newBoard[threatened.y][threatened.x] = CoerceoPiece.EMPTY.value;
                if (slice.turn % 2 === 0) {
                    newCaptureZero += 1;
                } else {
                    newCaptureOne += 1;
                }
            }
        }
        const newCaptures: { zero: number, one: number } = { one: newCaptureOne, zero: newCaptureZero };
        return new CoerceoPartSlice(newBoard, slice.turn, slice.tiles, newCaptures);
    }
    public isLegal(move: CoerceoMove, slice: CoerceoPartSlice): LegalityStatus {
        if (move.isTileExchange()) {
            return this.isLegalTileExchange(move, slice);
        } else {
            return this.isLegalMove(move, slice);
        }
    }
    public isLegalTileExchange(move: CoerceoMove, slice: CoerceoPartSlice): LegalityStatus {
        throw new Error('Method not implemented.');
    }
    public isLegalMove(move: CoerceoMove, slice: CoerceoPartSlice): LegalityStatus {
        if (slice.getBoardAt(move.start.get()) === CoerceoPiece.NONE.value) {
            return { legal: MGPValidation.failure('Cannot start with a coord outside the board ' + move.start.get().toString() + '.') };
        }
        if (slice.getBoardAt(move.landingCoord.get()) === CoerceoPiece.NONE.value) {
            return { legal: MGPValidation.failure('Cannot end with a coord outside the board ' + move.landingCoord.get().toString() + '.') };
        }
        if (slice.getBoardAt(move.start.get()) === CoerceoPiece.EMPTY.value) {
            return { legal: MGPValidation.failure(CoerceoFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY) };
        }
        if (slice.getBoardAt(move.start.get()) === slice.getCurrentEnnemy().value) {
            return { legal: MGPValidation.failure(Rules.CANNOT_CHOOSE_ENNEMY_PIECE) };
        }
        if (slice.getBoardAt(move.landingCoord.get()) === slice.getCurrentPlayer().value) {
            return { legal: MGPValidation.failure(CoerceoFailure.CANNOT_LAND_ON_ALLY) };
        }
        return { legal: MGPValidation.SUCCESS };
    }

}
