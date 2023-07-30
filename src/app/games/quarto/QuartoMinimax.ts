// QuartoHasher has been deleted in commit 81ae90ac28010516a3fe13d259836ce756297984
import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { QuartoPiece } from './QuartoPiece';
import { SCORE } from 'src/app/jscaip/SCORE';
import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { QuartoNode, BoardStatus, QuartoRules } from './QuartoRules';
import { Player } from 'src/app/jscaip/Player';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

export class QuartoMoveGenerator extends MoveGenerator<QuartoMove, QuartoState> {

    public getListMoves(node: QuartoNode): QuartoMove[] {
        const listMoves: QuartoMove[] = [];

        const state: QuartoState = node.gameState;

        const board: QuartoPiece[][] = state.getCopiedBoard();
        const pawns: Array<QuartoPiece> = state.getRemainingPieces();
        const inHand: QuartoPiece = state.pieceInHand;

        let nextBoard: QuartoPiece[][];

        for (let y: number = 0; y < 4; y++) {
            for (let x: number = 0; x < 4; x++) {
                if (board[y][x] === QuartoPiece.EMPTY) {
                    nextBoard = state.getCopiedBoard();
                    nextBoard[y][x] = inHand; // the piece we have in hand is put in (x, y)
                    if (state.turn === 15) {
                        const move: QuartoMove = new QuartoMove(x, y, QuartoPiece.EMPTY);
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
}

export class QuartoHeuristic extends Heuristic<QuartoMove, QuartoState> {

    private scoreToBoardValue(score: SCORE, turn: number): BoardValue {
        if (score === SCORE.DEFAULT) {
            return new BoardValue(0);
        } else {
            const player: Player = Player.of(turn % 2);
            if (score === SCORE.PRE_VICTORY) {
                return new BoardValue(player.getPreVictory());
            } else {
                return new BoardValue(player.getDefeatValue());
            }
        }
    }
    public getBoardValue(node: QuartoNode): BoardValue {
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            score: SCORE.DEFAULT,
            sensitiveSquares: new CoordSet(),
        };
        for (const line of QuartoRules.lines) {
            boardStatus = QuartoRules.updateBoardStatus(line, state, boardStatus);
            if (boardStatus.score === SCORE.VICTORY) {
                break;
            }
        }
        return this.scoreToBoardValue(boardStatus.score, state.turn);
    }
}

export class QuartoMinimax extends Minimax<QuartoMove, QuartoState> {

    public constructor() {
        super('QuartoMinimax', QuartoRules.get(), new QuartoHeuristic(), new QuartoMoveGenerator());
    }
}
