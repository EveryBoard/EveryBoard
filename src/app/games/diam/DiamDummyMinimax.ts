import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { GameStatus } from 'src/app/jscaip/Rules';
import { DiamMove } from './DiamMove';
import { DiamNode, DiamRules } from './DiamRules';
import { DiamState } from './DiamState';

export class DiamDummyMinimax extends Minimax<DiamMove, DiamState, LegalityStatus> {
    public getListMoves(node: DiamNode): DiamMove[] {
        // for any type of remaining piece of the current player
        // it can be dropped on any first empty spot in a stack (where there is space)

        // for any piece owned by the player on the board
        // it can be moved on any first empty spot in a stack (where there is space)
        throw new Error('NYI');
    }
    public getBoardValue(node: DiamNode): NodeUnheritance {
        const gameStatus: GameStatus = DiamRules.singleton.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        else return new NodeUnheritance(0);
    }
}
