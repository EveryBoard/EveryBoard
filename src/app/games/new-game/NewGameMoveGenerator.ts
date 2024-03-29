import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { NewGameMove } from './NewGameMove';
import { NewGameNode } from './NewGameRules';
import { NewGameState } from './NewGameState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

// A move generator lists possible moves for a game
export class NewGameMoveGenerator extends MoveGenerator<NewGameMove, NewGameState> {

    /**
     * This method lists all useful moves to consider in the move exploration.
     * In general, you can list all possible moves.
     * It is however an option to exclude some move of the list if:
     *     - they have no way to be needed in any interesting part
     *     - the can only lead to avoidable defeat
     * A move generator should never return an empty list in case there are possible moves.
     */
    public override getListMoves(_node: NewGameNode, _config: NoConfig): NewGameMove[] {
        return [new NewGameMove()];
    }
}
