import { Player, PlayerOrNone } from './Player';

export class BoardValue {

    public static fromWinner(player: PlayerOrNone): BoardValue {
        if (player.isPlayer()) {
            return new BoardValue(player.getVictoryValue());
        } else {
            return new BoardValue(0);
        }
    }
    /**
     * Returns the board value constructed from the player's scores
     * @param playerZeroScore the positive score of player zero
     * @param playerOneScore the positive score of player one
     */
    public static from(playerZeroScore: number, playerOneScore: number): BoardValue {
        playerZeroScore = playerZeroScore * Player.ZERO.getScoreModifier();
        playerOneScore = playerOneScore * Player.ONE.getScoreModifier();
        return new BoardValue(playerZeroScore + playerOneScore);
    }
    public toString(): string {
        return '' + this.value;
    }
    constructor(public readonly value: number) {}
}
