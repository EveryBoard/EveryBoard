import { Move } from "src/app/jscaip/Move";

/**
  * This class will describe the moves of your game
  * If your game's moves simply consist of dropping some piece on some coordinate and nothing else: use MoveCoord
  * If your game's moves simply consist of moving one coord from one place to another: use MoveCoordToCoord
  * If your game's moves affect two coordss but don't move one to the other, extends MoveWithTwoCoords
  * All move must extends the Move mother class
  */
export class NewGameMove extends Move {

    public toString(): string {
        throw new Error("This method is really more debug oriented");
    }
    public equals(other: this): boolean {
        throw new Error("This method help the minimaxes avoid creating two time the same move, which would slow its calculations");
    }
}