import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoPartSlice } from './CoerceoPartSlice';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { CoerceoNode, CoerceoRules } from './CoerceoRules';
import { GameStatus } from 'src/app/jscaip/Rules';


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
    public getBoardValue(node: CoerceoNode): NodeUnheritance {
        const status: GameStatus = CoerceoRules.getGameStatus(node);
        if (status.isEndGame) {
            return new NodeUnheritance(status.winner.getVictoryValue());
        }
        const state: CoerceoPartSlice = node.gamePartSlice;
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
}
