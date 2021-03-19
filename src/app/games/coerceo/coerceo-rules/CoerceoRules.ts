import { Coord } from 'src/app/jscaip/coord/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Rules } from 'src/app/jscaip/Rules';
import { display } from 'src/app/utils/collection-lib/utils';
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

    public static VERBOSE: boolean = false;

    public getListMoves(node: CoerceoNode): MGPMap<CoerceoMove, CoerceoPartSlice> {
        throw new Error('Method not implemented.');
    }
    public getBoardValue(move: CoerceoMove, slice: CoerceoPartSlice): number {
        throw new Error('Method not implemented.');
    }
    public applyLegalMove(move: CoerceoMove,
                          slice: CoerceoPartSlice,
                          status: LegalityStatus): { resultingMove: CoerceoMove, resultingSlice: CoerceoPartSlice; }
    {
        if (move.isTileExchange()) {
            return this.applyLegalTileExchange(move, slice, status);
        } else {
            return this.applyLegalDeplacement(move, slice, status);
        }
    }
    public applyLegalTileExchange(move: CoerceoMove,
                                  slice: CoerceoPartSlice,
                                  status: LegalityStatus): { resultingMove: CoerceoMove, resultingSlice: CoerceoPartSlice; }
    {
        const newBoard: number[][] = slice.getCopiedBoard();
        const captured: Coord = move.capture.get();
        newBoard[captured.y][captured.x] = CoerceoPiece.EMPTY.value;
        const newCaptures: [number, number] = [slice.captures[0], slice.captures[1]];
        newCaptures[slice.getCurrentPlayer().value] += 1;
        const newTiles: [number, number] = [slice.tiles[0], slice.tiles[1]];
        newTiles[slice.getCurrentPlayer().value] -= 2;
        const afterCapture: CoerceoPartSlice = new CoerceoPartSlice(newBoard,
                                                                    slice.turn,
                                                                    newTiles,
                                                                    newCaptures);
        const afterTileRemoval: CoerceoPartSlice = afterCapture.removeTilesIfNeeded(captured, false);
        const resultingSlice: CoerceoPartSlice = new CoerceoPartSlice(afterTileRemoval.getCopiedBoard(),
                                                                      afterTileRemoval.turn + 1,
                                                                      afterTileRemoval.tiles,
                                                                      afterTileRemoval.captures);
        display(CoerceoRules.VERBOSE,
                { coerceoRules_applyLegalTileExchange:
                    { a_initialSlice: slice, afterCapture, afterTileRemoval, resultingSlice } });
        return { resultingMove: null, resultingSlice };
    }
    public applyLegalDeplacement(move: CoerceoMove,
                                 slice: CoerceoPartSlice,
                                 status: LegalityStatus): { resultingMove: CoerceoMove, resultingSlice: CoerceoPartSlice; }
    {
        // Move the piece
        const afterDeplacement: CoerceoPartSlice = slice.applyLegalDeplacement(move);
        // removes emptied tiles
        const afterTilesRemoved: CoerceoPartSlice = afterDeplacement.removeTilesIfNeeded(move.start.get(), true);
        // removes captured pieces
        const afterCaptures: CoerceoPartSlice = afterTilesRemoved.doDeplacementCaptures(move);
        const resultingSlice: CoerceoPartSlice = new CoerceoPartSlice(afterCaptures.board,
                                                                      slice.turn + 1,
                                                                      afterCaptures.tiles,
                                                                      afterCaptures.captures);
        display(CoerceoRules.VERBOSE, {
            ab_slice: slice,
            afterDeplacement,
            afterTilesRemoved: afterTilesRemoved,
            d_afterCaptures: afterCaptures,
            resultingSlice: resultingSlice });
        return { resultingMove: move, resultingSlice };
    }
    public isLegal(move: CoerceoMove, slice: CoerceoPartSlice): LegalityStatus {
        if (move.isTileExchange()) {
            return this.isLegalTileExchange(move, slice);
        } else {
            return this.isLegalDeplacement(move, slice);
        }
    }
    public isLegalTileExchange(move: CoerceoMove, slice: CoerceoPartSlice): LegalityStatus {
        if (slice.tiles[slice.getCurrentPlayer().value] < 2) {
            return { legal: MGPValidation.failure('Not enough tiles to exchanges.') };
        }
        if (slice.getBoardAt(move.capture.get()) === CoerceoPiece.NONE.value) {
            return { legal: MGPValidation.failure('Cannot capture coord of removed tile!') };
        }
        if (slice.getBoardAt(move.capture.get()) === CoerceoPiece.EMPTY.value) {
            return { legal: MGPValidation.failure('Cannot capture empty coord!') };
        }
        if (slice.getBoardAt(move.capture.get()) === slice.getCurrentPlayer().value) {
            return { legal: MGPValidation.failure('Cannot capture your own pieces!') };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    public isLegalDeplacement(move: CoerceoMove, slice: CoerceoPartSlice): LegalityStatus {
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
