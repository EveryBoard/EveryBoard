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
        const moves: DiamMove[] = [];
        const remainingPieces: DiamPiece[] = this.getRemainingPiecesForCurrentPlayer(state);
        const shiftSources: Coord[] = this.getShiftSources(state);
        for (let x: number = 0; x < 8; x++) {
            const height: number = state.getStackHeight(x);
            for (let y: number = 3; y >= 0; y--) {
                const piece: DiamPiece = state.getPieceAtXY(x, y);
                if (piece === DiamPiece.EMPTY) {
                    // it can be the target for a drop or a shift
                    for (const shiftSource of shiftSources) {
                        if (state.getStackHeight(shiftSource.x) - (3 - shiftSource.y) + height <= 4) {

                            if ((shiftSource.x + 1) % 8 === x) {
                                moves.push(new DiamMoveShift(shiftSource, 'right'));
                            }
                            if ((shiftSource.x + 7) % 8 === x) {
                                moves.push(new DiamMoveShift(shiftSource, 'left'));
                            }
                        }
                    }
                    for (const piece of remainingPieces) {
                        moves.push(new DiamMoveDrop(x, piece));
                    }
                    break; // no need to continue iterating on y
                }
            }
        }
        return moves;
    }
    private getRemainingPiecesForCurrentPlayer(state: DiamState): DiamPiece[] {
        const pieces: DiamPiece[] = [];
        for (const piece of [
            DiamPiece.ZERO_FIRST, DiamPiece.ZERO_SECOND,
            DiamPiece.ONE_FIRST, DiamPiece.ONE_SECOND,
        ]) {
            if (state.getCurrentPlayer() === piece.owner &&
                state.getRemainingPiecesOf(piece) > 0) {
                pieces.push(piece);
            }
        }
        return pieces;
    }
    private getShiftSources(state: DiamState): Coord[] {
        const sources: Coord[] = [];
        const player: Player = state.getCurrentPlayer();
        for (let y: number = 3; y >= 0; y--) {
            for (let x: number = 0; x < DiamState.WIDTH; x++) {
                if (state.getPieceAtXY(x, y).owner === player) {
                    sources.push(new Coord(x, y));
                }
            }
        }
        return sources;
    }
    public getBoardValue(node: DiamNode): NodeUnheritance {
        const gameStatus: GameStatus = DiamRules.singleton.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        else return new NodeUnheritance(0);
    }
}
