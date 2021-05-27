import { Coord } from 'src/app/jscaip/Coord';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { DvonnMinimax } from './DvonnMinimax';
import { DvonnPartSlice } from './DvonnPartSlice';
import { DvonnNode, DvonnRules } from './DvonnRules';

export class MaxStacksDvonnMinimax extends DvonnMinimax {
    public getBoardValue(node: DvonnNode): NodeUnheritance {
        const slice: DvonnPartSlice = node.gamePartSlice;
        // Board value is percentage of the stacks controlled by the player
        const scores: number[] = DvonnRules.getScores(slice);
        const pieces: Coord[] = slice.hexaBoard.getAllPieces();
        const numberOfStacks: number = pieces.length;
        const player0Stacks: number = pieces.filter((c: Coord): boolean =>
            slice.hexaBoard.getAt(c).belongsTo(Player.ZERO)).length;
        const player1Stacks: number = pieces.filter((c: Coord): boolean =>
            slice.hexaBoard.getAt(c).belongsTo(Player.ONE)).length;
        return new NodeUnheritance(
            ((player0Stacks * scores[0] * Player.ZERO.getScoreModifier()) +
                (player1Stacks * scores[1] * Player.ONE.getScoreModifier())) / numberOfStacks);
    }
}
