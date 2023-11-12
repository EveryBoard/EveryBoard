import { GameState } from 'src/app/jscaip/GameState';

/**
 * This class represent the state of the game at a specific turn.
 * It should extend `GameState` in the general case, which requires only to include a `turn` field.
 * You can rely on more specific types of boards, depending on your game:
 *   - `GameStateWithTable` for games that use square spaces in a limited rectangular boards (with or without holes).
 *   - `HexagonalGameState` for games that use hexagonal spaces in a limited space.
 *   - `OpenHexagonalGameState` for games that use hexagonal spaces but in an unlimited space,
 *   - `TriangularGameState` for games that use triangular spaces in a limited space.
 *
 * A common pattern is to have a state made of a `Table` (a 2D array) of * `PlayerOrNone` values,
 * where `Player.ZERO` and `Player.ONE` denote the presence of a player piece, while `Player.NONE`
 * denotes the absence of a piece at that location.
 */
export class DraughtState extends GameState {

    /**
     * This static method should create the initial state of the game.
     */
    public static getInitialState(): DraughtState {
        return new DraughtState(0);
    }
}
