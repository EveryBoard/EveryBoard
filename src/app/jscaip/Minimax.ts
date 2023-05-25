import { MGPNode } from './MGPNode';
import { Move } from './Move';
import { BoardValue } from './BoardValue';
import { Rules } from './Rules';
import { GameState } from './GameState';
import { GameStatus } from './GameStatus';

export abstract class Minimax<M extends Move,
                              S extends GameState,
                              L = void,
                              B extends BoardValue = BoardValue,
                              R extends Rules<M, S, L> = Rules<M, S, L>>
{

    public constructor(public readonly ruler: R,
                       public readonly name: string) {
    }
    /**
     * Gives the list of all the possible moves.
     * Has to be implemented for each rule so that the AI can choose among theses moves.
     * This function could give an incomplete set of data if some of them are redundant
     * or if some of them are too bad to be interesting to count, as a matter of performance.
     */
    public abstract getListMoves(node: MGPNode<R, M, S, L>): M[];

    /**
     * Assigns a value to a game state.
     * Used to give a comparable data type linked to the current GameState
     * so that the AI can know which state is better
     */
    public abstract getBoardValue(node: MGPNode<R, M, S, L>): B;

    public toString(): string {
        return this.name;
    }
}

export abstract class PlayerMetricsMinimax<M extends Move,
                                           S extends GameState,
                                           L = void,
                                           R extends Rules<M, S, L> = Rules<M, S, L>>
    extends Minimax<M, S, L, BoardValue, R>
{

  /**
   * Assigns a metric for each player, as [player0, player1].
   * A metric is just a number that the minimax will try to maximize for each player.
   * It can be positive, negative, or zero. In general, both numbers will be positive.
   */
  public abstract getMetrics(node: MGPNode<R, M, S, L>): [number, number];

  public getBoardValue(node: MGPNode<R, M, S, L>): BoardValue {
      const gameStatus: GameStatus = this.ruler.getGameStatus(node);
      if (gameStatus.isEndGame) {
          return BoardValue.fromWinner(gameStatus.winner);
      } else {
          const metrics: [number, number] = this.getMetrics(node);
          return BoardValue.of(metrics[0], metrics[1]);
      }
  }
}

export abstract class AbstractMinimax extends Minimax<Move, GameState, unknown> {
}
