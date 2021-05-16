import { AwalePartSlice } from './AwalePartSlice';
import { AwaleMove } from './AwaleMove';
import { AwaleLegalityStatus } from './AwaleLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { AwaleNode, AwaleRules } from './AwaleRules';


export class AwaleMinimax extends Minimax<AwaleMove, AwalePartSlice, AwaleLegalityStatus> {

    public getListMoves(n: AwaleNode): AwaleMove[] {

        const choices: AwaleMove[] = [];
        const oldSlice: AwalePartSlice = n.gamePartSlice;
        const turn: number = oldSlice.turn;
        const player: number = turn % 2;
        let newMove: AwaleMove;
        let x: number = 0;
        do {
            // for each house that might be playable
            if (n.gamePartSlice.getBoardByXY(x, player) !== 0) {
                // if the house is not empty
                newMove = new AwaleMove(x, player);
                const legality: AwaleLegalityStatus = AwaleRules.isLegal(newMove, oldSlice); // see if the move is legal

                if (legality.legal.isSuccess()) {
                    // if the move is legal, we addPart it to the listMoves
                    newMove = new AwaleMove(x, player);

                    choices.push(newMove);
                }
            }
            x++;
        } while (x < 6);
        return choices;
    }
    public getBoardValue(move: AwaleMove, slice: AwalePartSlice): NodeUnheritance {

        const player: number = slice.turn % 2;
        const ennemy: number = (player + 1) % 2;
        const captured: number[] = slice.getCapturedCopy();
        const c1: number = captured[1];
        const c0: number = captured[0];
        const board: number[][] = slice.getCopiedBoard();
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
