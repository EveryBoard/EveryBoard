import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { CoerceoNode, CoerceoRules } from './CoerceoRules';
import { GameStatus } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

export class CoerceoMinimax extends Minimax<CoerceoMove, CoerceoState> {

    public getListMoves(node: CoerceoNode): CoerceoMove[] {
        let moves: CoerceoMove[] = this.getListExchanges(node);
        moves = moves.concat(this.getListDeplacement(node));
        return this.putCaptureFirst(node, moves);
    }
    public getListExchanges(node: CoerceoNode): CoerceoMove[] {
        const exchanges: CoerceoMove[] = [];
        const state: CoerceoState = node.gameState;
        const PLAYER: number = state.getCurrentPlayer().value;
        const ENEMY: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentEnnemy());
        if (state.tiles[PLAYER] < 2) {
            return exchanges;
        }
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 15; x++) {
                const captured: Coord = new Coord(x, y);
                if (state.getPieceAt(captured) === ENEMY) {
                    const move: CoerceoMove = CoerceoMove.fromTilesExchange(captured);
                    exchanges.push(move);
                }
            }
        }
        return exchanges;
    }
    public getListDeplacement(node: CoerceoNode): CoerceoMove[] {
        const deplacements: CoerceoMove[] = [];
        const state: CoerceoState = node.gameState;
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 15; x++) {
                const start: Coord = new Coord(x, y);
                if (state.getPieceAt(start).is(state.getCurrentPlayer())) {
                    const legalLandings: Coord[] = state.getLegalLandings(start);
                    for (const end of legalLandings) {
                        const move: CoerceoMove = CoerceoMove.fromCoordToCoord(start, end);
                        deplacements.push(move);
                    }
                }
            }
        }
        return deplacements;
    }
    public getBoardValue(node: CoerceoNode): NodeUnheritance {
        const status: GameStatus = CoerceoRules.getGameStatus(node);
        if (status.isEndGame) {
            return NodeUnheritance.fromWinner(status.winner);
        }
        const state: CoerceoState = node.gameState;
        const piecesByFreedom: number[][] = state.getPiecesByFreedom();
        const piecesScores: number[] = this.getPiecesScore(piecesByFreedom);
        const scoreZero: number = (2 * state.captures[0]) + piecesScores[0];
        const scoreOne: number = (2 * state.captures[1]) + piecesScores[1];
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
    public putCaptureFirst(node: CoerceoNode, moves: CoerceoMove[]): CoerceoMove[] {
        ArrayUtils.sortByDescending(moves, (move: CoerceoMove) => {
            return this.moveCapturesList(node, move).length;
        });
        return moves;
    }
    public moveCapturesList(node: CoerceoNode, move: CoerceoMove): Coord[] {
        if (move.isTileExchange()) {
            return [move.capture.get()];
        } else {
            // Move the piece
            const afterDeplacement: CoerceoState = node.gameState.applyLegalDeplacement(move);
            // removes emptied tiles
            const afterTilesRemoved: CoerceoState = afterDeplacement.removeTilesIfNeeded(move.start.get(), true);
            return afterTilesRemoved.getCapturedNeighbors(move.landingCoord.get());
        }
    }
}
