import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { DiamMove, DiamMoveDrop, DiamMoveShift } from './DiamMove';
import { DiamPiece } from './DiamPiece';
import { DiamNode, DiamRules } from './DiamRules';
import { DiamState } from './DiamState';

export class DiamDummyMinimax extends Minimax<DiamMove, DiamState, LegalityStatus> {
    public getListMoves(node: DiamNode): DiamMove[] {
        const state: DiamState = node.gameState;
        const drops: DiamMove[] = this.getListDrops(state);
        const shifts: DiamMove[] = this.getListShifts(state);
        return drops.concat(shifts);
    }
    private getListShifts(state: DiamState): DiamMoveShift[] {
        const shifts: DiamMoveShift[] = [];
        const shiftSources: Coord[] = this.getShiftSources(state);
        for (let x: number = 0; x < DiamState.WIDTH; x++) {
            const height: number = state.getStackHeight(x);
            for (let y: number = 0; y < DiamState.HEIGHT; y++) {
                const piece: DiamPiece = state.getPieceAtXY(x, y);
                if (piece === DiamPiece.EMPTY) {
                    // it can be the target for a drop or a shift
                    for (const shiftSource of shiftSources) {
                        const movedHeight: number = state.getStackHeight(shiftSource.x) - shiftSource.y;
                        const resultingHeight: number = height + movedHeight;
                        if (resultingHeight < DiamState.HEIGHT) {
                            if ((shiftSource.x + 1) % DiamState.WIDTH === x) {
                                shifts.push(new DiamMoveShift(shiftSource, 'clockwise'));
                            }
                            if ((shiftSource.x + (DiamState.WIDTH-1)) % DiamState.WIDTH === x) {
                                shifts.push(new DiamMoveShift(shiftSource, 'anticlockwise'));
                            }
                        }
                    }
                    break; // no need to continue iterating on this y
                }
            }
        }
        return shifts;
    }
    private getListDrops(state: DiamState): DiamMoveDrop[] {
        const remainingPieces: DiamPiece[] = this.getRemainingPiecesForCurrentPlayer(state);
        const drops: DiamMoveDrop[] = [];
        for (let x: number = 0; x < DiamState.WIDTH; x++) {
            for (let y: number = 0; y < DiamState.HEIGHT; y++) {
                const piece: DiamPiece = state.getPieceAtXY(x, y);
                if (piece === DiamPiece.EMPTY) {
                    // it can be the target for a drop
                    for (const piece of remainingPieces) {
                        drops.push(new DiamMoveDrop(x, piece));
                    }
                    break; // no need to continue iterating on this y
                }
            }
        }
        return drops;
    }
    private getRemainingPiecesForCurrentPlayer(state: DiamState): DiamPiece[] {
        const pieces: DiamPiece[] = [];
        for (const piece of DiamPiece.PLAYER_PIECES) {
            if (this.currentPlayerCanDropPiece(state, piece)) {
                pieces.push(piece);
            }
        }
        return pieces;
    }
    private currentPlayerCanDropPiece(state: DiamState, piece: DiamPiece): boolean {
        return state.getCurrentPlayer() === piece.owner &&
            state.getRemainingPiecesOf(piece) > 0;
    }
    private getShiftSources(state: DiamState): Coord[] {
        const sources: Coord[] = [];
        const player: Player = state.getCurrentPlayer();
        for (let y: number = 0; y < DiamState.HEIGHT; y++) {
            for (let x: number = 0; x < DiamState.WIDTH; x++) {
                if (state.getPieceAtXY(x, y).owner === player) {
                    sources.push(new Coord(x, y));
                }
            }
        }
        return sources;
    }
    public getBoardValue(node: DiamNode): NodeUnheritance {
        const gameStatus: GameStatus = DiamRules.get().getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        else return new NodeUnheritance(0);
    }
}
