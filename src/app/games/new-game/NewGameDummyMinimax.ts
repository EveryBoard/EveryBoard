import { Minimax } from 'src/app/jscaip/Minimax';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { NewGameBoardValue, NewGameLegalityInfo, NewGameNode, NewGameRules } from './NewGameRules';

/**
  * Minimax are the class that will help the LocalGameWrapperComponent to make the AI play your game
  * It will be drawing a tree of a given depth (choosable on the component by the user)
  */
export class NewGameDummyMinimax extends Minimax<NewGameMove,
                                                 NewGameState,
                                                 NewGameLegalityInfo,
                                                 NewGameBoardValue,
                                                 NewGameRules>
{
    /** This method has to list all the usefull move.
     * It is an option to exclude some move of the list if:
     *     - they have no way to be needed for the good continuation (hence, there should always be one move returned)
     *     - the can only lead to defeat
     * Note that, by convention, we call "Dummy" minimax that:
     *      - don't do any filter on the move list
     *      - don't use intelligence in getBoardValue
     */
    public getListMoves(node: NewGameNode): NewGameMove[] {
        throw new Error('Method not implemented.');
    }
    /**
      * If score is 0: it means no player has an advantage
      * If score is positive: it means Player.ONE has an advantage
      * If score is negative: it means Player.ZERO has an advantage
      * If score is Number.MAX_SAFE_INTEGER: it means Player.ONE won
      * If score is Number.MIN_SAFE_INTEGER: it means Player.ZERO won
      */
    public getBoardValue(node: NewGameNode): NewGameBoardValue {
        throw new Error('Method not implemented.');
    }

}
