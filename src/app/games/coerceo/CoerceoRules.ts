import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoPartSlice, CoerceoPiece } from './CoerceoPartSlice';
import { CoerceoFailure } from './CoerceoFailure';

export abstract class CoerceoNode extends MGPNode<CoerceoRules, CoerceoMove, CoerceoPartSlice> {}

export class CoerceoRules extends Rules<CoerceoMove, CoerceoPartSlice> {

    public static VERBOSE: boolean = false;

    public applyLegalMove(move: CoerceoMove,
                          slice: CoerceoPartSlice,
                          status: LegalityStatus)
    : CoerceoPartSlice
    {
        if (move.isTileExchange()) {
            return this.applyLegalTileExchange(move, slice, status);
        } else {
            return this.applyLegalDeplacement(move, slice, status);
        }
    }
    public applyLegalTileExchange(move: CoerceoMove,
                                  slice: CoerceoPartSlice,
                                  status: LegalityStatus)
    : CoerceoPartSlice
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
        return resultingSlice;
    }
    public applyLegalDeplacement(
        move: CoerceoMove,
        slice: CoerceoPartSlice,
        status: LegalityStatus)
    : CoerceoPartSlice
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
        return resultingSlice;
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
            return { legal: MGPValidation.failure(CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE) };
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
            const reason: string = 'Cannot start with a coord outside the board ' + move.start.get().toString() + '.';
            return { legal: MGPValidation.failure(reason) };
        }
        if (slice.getBoardAt(move.landingCoord.get()) === CoerceoPiece.NONE.value) {
            const reason: string =
                'Cannot end with a coord outside the board ' + move.landingCoord.get().toString() + '.';
            return { legal: MGPValidation.failure(reason) };
        }
        if (slice.getBoardAt(move.start.get()) === CoerceoPiece.EMPTY.value) {
            return { legal: MGPValidation.failure(CoerceoFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY) };
        }
        if (slice.getBoardAt(move.start.get()) === slice.getCurrentEnnemy().value) {
            return { legal: MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_ENNEMY_PIECE) };
        }
        if (slice.getBoardAt(move.landingCoord.get()) === slice.getCurrentPlayer().value) {
            return { legal: MGPValidation.failure(CoerceoFailure.CANNOT_LAND_ON_ALLY) };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    public static getGameStatus(node: CoerceoNode): GameStatus {
        const state: CoerceoPartSlice = node.gamePartSlice;
        if (state.captures[0] >= 18) {
            return GameStatus.ZERO_WON;
        }
        if (state.captures[1] >= 18) {
            return GameStatus.ONE_WON;
        }
        return GameStatus.ONGOING;
    }
    public getGameStatus(node: CoerceoNode): GameStatus {
        return CoerceoRules.getGameStatus(node);
    }
}
