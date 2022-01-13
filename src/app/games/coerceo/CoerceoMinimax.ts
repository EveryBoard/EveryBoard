import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { CoerceoNode, CoerceoRules } from './CoerceoRules';
import { GameStatus } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Player } from 'src/app/jscaip/Player';

export class CoerceoMinimax extends Minimax<CoerceoMove, CoerceoState> {

    public getListMoves(node: CoerceoNode): CoerceoMove[] {
        let moves: CoerceoMove[] = this.getListExchanges(node);
        moves = moves.concat(this.getListMovement(node));
        return this.putCaptureFirst(node, moves);
    }
    public getListExchanges(node: CoerceoNode): CoerceoMove[] {
        const exchanges: CoerceoMove[] = [];
        const state: CoerceoState = node.gameState;
        const PLAYER: number = state.getCurrentPlayer().value;
        const OPPONENT: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentOpponent());
        if (state.tiles[PLAYER] < 2) {
            return exchanges;
        }
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 15; x++) {
                const captured: Coord = new Coord(x, y);
                if (state.getPieceAt(captured) === OPPONENT) {
                    const move: CoerceoMove = CoerceoMove.fromTilesExchange(captured);
                    exchanges.push(move);
                }
            }
        }
        return exchanges;
    }
    public getListMovement(node: CoerceoNode): CoerceoMove[] {
        const movements: CoerceoMove[] = [];
        const state: CoerceoState = node.gameState;
        const PLAYER: Player = state.getCurrentPlayer();
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 15; x++) {
                const start: Coord = new Coord(x, y);
                if (state.getPieceAt(start).is(PLAYER)) {
                    const legalLandings: Coord[] = state.getLegalLandings(start);
                    for (const end of legalLandings) {
                        const move: CoerceoMove = CoerceoMove.fromCoordToCoord(start, end);
                        movements.push(move);
                    }
                }
            }
        }
        return movements;
    }
    public getBoardValue(node: CoerceoNode): NodeUnheritance {
        const gameStatus: GameStatus = CoerceoRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return NodeUnheritance.fromWinner(gameStatus.winner);
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
            const afterMovement: CoerceoState = node.gameState.applyLegalMovement(move);
            // removes emptied tiles
            const afterTilesRemoved: CoerceoState = afterMovement.removeTilesIfNeeded(move.start.get(), true);
            return afterTilesRemoved.getCapturedNeighbors(move.landingCoord.get());
        }
    }
}
