import { AwalePartSlice } from './AwalePartSlice';
import { AwaleMove } from './AwaleMove';
import { AwaleLegalityStatus } from './AwaleLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { AwaleNode, AwaleRules } from './AwaleRules';
import { GameStatus } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';


export class AwaleMinimax extends Minimax<AwaleMove, AwalePartSlice, AwaleLegalityStatus> {

    public getListMoves(node: AwaleNode): AwaleMove[] {
        const moves: AwaleMove[] = [];
        const state: AwalePartSlice = node.gamePartSlice;
        const turn: number = state.turn;
        const player: number = turn % 2;
        let newMove: AwaleMove;
        let x: number = 0;
        do {
            // for each house that might be playable
            if (state.getBoardByXY(x, player) !== 0) {
                // if the house is not empty
                newMove = new AwaleMove(x, player);
                const legality: AwaleLegalityStatus = AwaleRules.isLegal(newMove, state); // see if the move is legal

                if (legality.legal.isSuccess()) {
                    // if the move is legal, we addPart it to the listMoves
                    newMove = new AwaleMove(x, player);

                    moves.push(newMove);
                }
            }
            x++;
        } while (x < 6);
        return this.orderMoves(node, moves);
    }
    private orderMoves(node: AwaleNode, moves: AwaleMove[]): AwaleMove[] {
        const player: number = node.gamePartSlice.getCurrentPlayer().value;
        const opponent: number = node.gamePartSlice.getCurrentPlayer().getOpponent().value;
        // sort by captured cases
        ArrayUtils.sortByDescending(moves, (move: AwaleMove): number => {
            const board: number[][] = node.gamePartSlice.getCopiedBoard();
            const toDistribute: number = board[move.coord.y][move.coord.x];
            const endCase: Coord = AwaleRules.distribute(move.coord.x, move.coord.y, board);
            let captured: number;
            let sameTerritoryValue: number = 0;
            if (endCase.y === player) {
                captured = 0;
                if (toDistribute <= 6) {
                    sameTerritoryValue = 10;
                }
            } else {
                captured = AwaleRules.capture(endCase.x, opponent, player, board);
            }
            // Prioritise captured, then moves in same territory, then tries to minimize number of pieces distributed
            return captured * 100 + sameTerritoryValue - toDistribute;
        });
        return moves;
    }
    public getBoardValue(node: AwaleNode): NodeUnheritance {
        const status: GameStatus = AwaleRules.getGameStatus(node);
        if (status.isEndGame) {
            return NodeUnheritance.fromWinner(status.winner);
        }

        const state: AwalePartSlice = node.gamePartSlice;
        const player: number = state.turn % 2;
        const ennemy: number = (player + 1) % 2;
        const captured: number[] = state.getCapturedCopy();
        const c1: number = captured[1];
        const c0: number = captured[0];
        const board: number[][] = state.getCopiedBoard();
        if (AwaleRules.isStarving(player, board)) { // TODO tester de l'enlever
            if (!AwaleRules.canDistribute(ennemy, board)) {
                return new NodeUnheritance((c0 > c1) ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
            }
        }

        if (c1 > 24) {
            return new NodeUnheritance(Player.ONE.getVictoryValue());
        }
        if (c0 > 24) {
            return new NodeUnheritance(Player.ZERO.getVictoryValue());
        }
        return new NodeUnheritance(c1 - c0);
    }
}
