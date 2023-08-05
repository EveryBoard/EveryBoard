import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoMove, CoerceoRegularMove, CoerceoTileExchangeMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoNode } from './CoerceoRules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';

export class CoerceoMinimax extends PlayerMetricsMinimax<CoerceoMove, CoerceoState> {

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
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content === OPPONENT) {
                const move: CoerceoMove = CoerceoTileExchangeMove.of(coordAndContent.coord);
                exchanges.push(move);
            }
        }
        return exchanges;
    }
    public getListMovement(node: CoerceoNode): CoerceoMove[] {
        const movements: CoerceoMove[] = [];
        const state: CoerceoState = node.gameState;
        const player: Player = state.getCurrentPlayer();
        for (const coordAndContent of state.getCoordsAndContents()) {
            const start: Coord = coordAndContent.coord;
            if (coordAndContent.content.is(player)) {
                const legalLandings: Coord[] = state.getLegalLandings(start);
                for (const end of legalLandings) {
                    const move: CoerceoMove = CoerceoRegularMove.of(start, end);
                    movements.push(move);
                }
            }
        }
        return movements;
    }
    public getMetrics(node: CoerceoNode): [number, number] {
        const state: CoerceoState = node.gameState;
        const piecesByFreedom: number[][] = state.getPiecesByFreedom();
        const piecesScores: number[] = this.getPiecesScore(piecesByFreedom);
        const scoreZero: number = (2 * state.captures[0]) + piecesScores[0];
        const scoreOne: number = (2 * state.captures[1]) + piecesScores[1];
        return [scoreZero, scoreOne];
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
        if (CoerceoMove.isTileExchange(move)) {
            return [move.coord];
        } else {
            // Move the piece
            const afterMovement: CoerceoState = node.gameState.applyLegalMovement(move);
            // removes emptied tiles
            const afterTilesRemoved: CoerceoState = afterMovement.removeTilesIfNeeded(move.getStart(), true);
            return afterTilesRemoved.getCapturedNeighbors(move.getEnd());
        }
    }
}
