import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from './SaharaMove';
import { SaharaPartSlice } from './SaharaPartSlice';
import { TriangularGameState } from 'src/app/jscaip/TriangularGameState';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { GameStatus } from 'src/app/jscaip/Rules';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

export class SaharaMinimax extends Minimax<SaharaMove, SaharaPartSlice> {

    public getListMoves(node: SaharaNode): SaharaMove[] {
        const moves: SaharaMove[] = [];
        const board: number[][] = node.gamePartSlice.getCopiedBoard();
        const player: Player = node.gamePartSlice.getCurrentPlayer();
        const startingCoords: Coord[] = SaharaRules.getStartingCoords(board, player);
        for (const start of startingCoords) {
            const neighboors: Coord[] =
                TriangularGameState.getEmptyNeighboors(board, start, FourStatePiece.EMPTY.value);
            for (const neighboor of neighboors) {
                const newMove: SaharaMove = new SaharaMove(start, neighboor);
                board[neighboor.y][neighboor.x] = board[start.y][start.x];
                board[start.y][start.x] = FourStatePiece.EMPTY.value;
                moves.push(newMove);

                const upwardTriangle: boolean = (neighboor.y + neighboor.x) % 2 === 0;
                if (upwardTriangle) {
                    const farNeighboors: Coord[] =
                        TriangularGameState.getEmptyNeighboors(board, neighboor, FourStatePiece.EMPTY.value);
                    for (const farNeighboor of farNeighboors) {
                        if (!farNeighboor.equals(start)) {
                            const farMove: SaharaMove = new SaharaMove(start, farNeighboor);
                            board[farNeighboor.y][farNeighboor.x] = board[neighboor.y][neighboor.x];
                            board[neighboor.y][neighboor.x] = FourStatePiece.EMPTY.value;
                            moves.push(farMove);

                            board[neighboor.y][neighboor.x] = board[farNeighboor.y][farNeighboor.x];
                            board[farNeighboor.y][farNeighboor.x] = FourStatePiece.EMPTY.value;
                        }
                    }
                }
                board[start.y][start.x] = board[neighboor.y][neighboor.x];
                board[neighboor.y][neighboor.x] = FourStatePiece.EMPTY.value;
            }
        }
        return moves;
    }
    public getBoardValue(node: SaharaNode): NodeUnheritance {
        const slice: SaharaPartSlice = node.gamePartSlice;
        const board: number[][] = slice.getCopiedBoard();
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ONE);
        const gameStatus: GameStatus = SaharaRules.getGameStatusFromFreedoms(zeroFreedoms, oneFreedoms);
        if (gameStatus.isEndGame) {
            return NodeUnheritance.fromWinner(gameStatus.winner);
        }
        let i: number = 0;
        while (i < 6 && zeroFreedoms[i] === oneFreedoms[i]) {
            i++;
        }
        return new NodeUnheritance(oneFreedoms[i % 6] - zeroFreedoms[i % 6]);
    }
}
