import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { QuartoPiece } from './QuartoPiece';
import { SCORE } from 'src/app/jscaip/SCORE';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { QuartoNode, BoardStatus, QuartoRules } from './QuartoRules';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';

export class QuartoMinimax extends Minimax<QuartoMove, QuartoState> {

    public static scoreToBoardValue(score: SCORE, turn: number): NodeUnheritance {
        if (score === SCORE.DEFAULT) {
            return new NodeUnheritance(0);
        } else {
            const player: Player = Player.of(turn % 2);
            if (score === SCORE.PRE_VICTORY) {
                return new NodeUnheritance(player.getPreVictory());
            } else {
                return new NodeUnheritance(player.getDefeatValue());
            }
        }
    }
    public getListMoves(node: QuartoNode): QuartoMove[] {
        const listMoves: QuartoMove[] = [];

        const state: QuartoState = node.gameState;

        const board: QuartoPiece[][] = state.getCopiedBoard();
        const pawns: Array<QuartoPiece> = state.getRemainingPawns();
        const inHand: QuartoPiece = state.pieceInHand;

        let nextBoard: QuartoPiece[][];

        for (let y: number = 0; y < 4; y++) {
            for (let x: number = 0; x < 4; x++) {
                if (board[y][x] === QuartoPiece.NONE) {
                    nextBoard = state.getCopiedBoard();
                    nextBoard[y][x] = inHand; // the piece we have in hand is put in (x, y)
                    if (state.turn === 15) {
                        const move: QuartoMove = new QuartoMove(x, y, QuartoPiece.NONE);
                        listMoves.push(move);
                        return listMoves;
                    }
                    // For each empty square
                    for (const remainingPiece of pawns) { // the piece we will give
                        const move: QuartoMove = new QuartoMove(x, y, remainingPiece); // this is the move
                        listMoves.push(move);
                    }
                }
            }
        }
        return listMoves;
    }
    public getBoardValue(node: QuartoNode): NodeUnheritance {
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            score: SCORE.DEFAULT,
            sensitiveSquares: new MGPMap(),
        };
        for (const line of QuartoRules.lines) {
            boardStatus = QuartoRules.updateBoardStatus(line, state, boardStatus);
            if (boardStatus.score === SCORE.VICTORY) {
                break;
            }
        }
        return QuartoMinimax.scoreToBoardValue(boardStatus.score, state.turn);
    }
}
