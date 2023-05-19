import { Move } from "src/app/jscaip/Move";

/**
  * This class represents the moves of your game.
  * In most cases, your moves into one of the following categories, already implemented by the class of the same name:
  *   - `MoveCoord`: for moves that consist of selecting only a single space (e.g., dropping a piece on a board)
  *   - `MoveCoordToCoord`: for moves that consist of moving from one space to another
  *   - `MoveWithTwoCoords`: for moves that affect two spaces, but are not moves from one to the other.
  * All move must extends the `Move` parent class
  */
export class NewGameMove extends Move {

    public toString(): string {
        throw new Error('This method is really more debug oriented');
    }
    public equals(other: this): boolean {
        throw new Error('This method helps the minimaxes avoid creating two times the same move, which would slow its calculations');
    }
}
