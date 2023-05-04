import { BoardValue } from 'src/app/jscaip/BoardValue';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { MGPOptional } from 'src/app/utils/MGPOptional';

/**
  * This optional class is the type of info that get return by rules.isLegal.
  * This is then automatically provided to applyLegalMove, it can so avoid duplicated calculation if needed.
  * It is optional and has no mandatory structure nor use outside the use you'll make of it.
  */
export class NewGameLegalityInfo {
}

/**
  * The default BoardValue is just a number wrapper, but you could add more info about it.
  */
export class NewGameBoardValue extends BoardValue {
}

/**
  * TODO: TODOTODO: give best use of its uses !
  */
export class NewGameNode extends MGPNode<Rules<NewGameMove, NewGameState, NewGameLegalityInfo, NewGameBoardValue>,
                                         NewGameMove,
                                         NewGameState,
                                         NewGameLegalityInfo,
                                         NewGameBoardValue> {}

/**
  * This class will have a singleton instance and will be used by the wrappers to test if the move is legal
  * Then this class will apply the moves on the states
  */
export class NewGameRules extends Rules<NewGameMove, NewGameState, NewGameLegalityInfo, NewGameBoardValue> {

    private static singleton: MGPOptional<NewGameRules> = MGPOptional.empty();

    public static get(): NewGameRules {
        if (NewGameRules.singleton.isAbsent()) {
            NewGameRules.singleton = MGPOptional.of(new NewGameRules());
        }
        return NewGameRules.singleton.get();
    }
    private constructor() {
        super(NewGameState);
    }
    /**
      * @param move the move to apply to the state
      * @param state the state on which to apply the move
      * @param info the eventual info that had been returned by "isLegal"
      * @Returns the state on which move has been applied, the resulting state
     */
    public applyLegalMove(move: NewGameMove, state: NewGameState, info: NewGameLegalityInfo): NewGameState {
        throw new Error('Method not implemented.');
    }
    /**
      * @param move the move to test on state
      * @param state the state on which to teest the move
      * @retuns a MGPFallible of the GameLegalityInfo
     */
    public isLegal(move: NewGameMove, state: NewGameState): MGPFallible<NewGameLegalityInfo> {
        throw new Error('Method not implemented.');
    }
    /**
      * @param node the node of which we'll test the state
      * @returns a GameStatus (ZERO_WON, ONE_WON, DRAW, ONGOING)
      */
    public getGameStatus(node: NewGameNode): GameStatus {
        throw new Error('Method not implemented.');
    }
}
