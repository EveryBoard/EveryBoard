import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoPartSlice, CoerceoPiece } from './CoerceoPartSlice';
import { CoerceoFailure } from './CoerceoFailure';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';

export abstract class CoerceoNode extends MGPNode<CoerceoRules, CoerceoMove, CoerceoPartSlice> {}

export class CoerceoMinimax extends Minimax<CoerceoMove, CoerceoPartSlice> {

    public getListMoves(node: CoerceoNode): CoerceoMove[] {
        const moves: CoerceoMove[] = this.getListDeplacement(node);
        return moves.concat(this.getListExchanges(node));
    }
    public getListDeplacement(node: CoerceoNode): CoerceoMove[] {
        const deplacements: CoerceoMove[] = [];
        const slice: CoerceoPartSlice = node.gamePartSlice;
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 15; x++) {
                const start: Coord = new Coord(x, y);
                if (slice.getBoardAt(start) === slice.getCurrentPlayer().value) {
                    const legalLandings: Coord[] = slice.getLegalLandings(start);
                    for (const end of legalLandings) {
                        const move: CoerceoMove = CoerceoMove.fromCoordToCoord(start, end);
                        deplacements.push(move);
                    }
                }
            }
        }
        return deplacements;
    }
    public getListExchanges(node: CoerceoNode): CoerceoMove[] {
        const exchanges: CoerceoMove[] = [];
        const slice: CoerceoPartSlice = node.gamePartSlice;
        const PLAYER: number = slice.getCurrentPlayer().value;
        const ENNEMY: number = slice.getCurrentEnnemy().value;
        if (slice.tiles[PLAYER] < 2) {
            return exchanges;
        }
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 15; x++) {
                const captured: Coord = new Coord(x, y);
                if (slice.getBoardAt(captured) === ENNEMY) {
                    const move: CoerceoMove = CoerceoMove.fromTilesExchange(captured);
                    exchanges.push(move);
                }
            }
        }
        return exchanges;
    }
    public getBoardValue(move: CoerceoMove, slice: CoerceoPartSlice): NodeUnheritance {
        const piecesByFreedom: number[][] = slice.getPiecesByFreedom();
        const piecesScores: number[] = this.getPiecesScore(piecesByFreedom);
        const scoreZero: number = (2 * slice.captures[0]) + piecesScores[0];
        const scoreOne: number = (2 * slice.captures[1]) + piecesScores[1];
        if (slice.captures[0] === 18) {
            // Everything captured, victory
            return new NodeUnheritance(Number.MIN_SAFE_INTEGER);
        }
        if (slice.captures[1] === 18) {
            // Everything captured, victory
            return new NodeUnheritance(Number.MAX_SAFE_INTEGER);
        }
        return new NodeUnheritance(scoreOne - scoreZero);
    }
    public getPiecesScore(piecesByFreedom: number[][]): number[] {
        return [
            this.getPlayerPiecesScore(piecesByFreedom[0]),
            this.getPlayerPiecesScore(piecesByFreedom[1]),
        ];
    }
    public getPlayerPiecesScore(piecesScores: number[]): number {
        return (3 * piecesScores[0]) +
               (1 * piecesScores[1]) +
               (3 * piecesScores[2]) +
               (3 * piecesScores[3]);
    }
}
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
    public isGameOver(state: CoerceoPartSlice): boolean {
        return state.captures[0] === 18 ||
               state.captures[1] === 18;
    }
}
