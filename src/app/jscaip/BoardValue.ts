import { Player, PlayerOrNone } from './Player';

export class BoardValue {

    public static fromWinner(player: PlayerOrNone): BoardValue {
        // TODO FOR REVIEW: j'ai un peu autisté là pour le coup avec from=fallible mais ofWinner c'est bizarre
        // Et deux trois autres modif que j'ai faite ont pu être pareille, sorry :D
        if (player.isPlayer()) {
            return new BoardValue(player.getVictoryValue());
        } else {
            return new BoardValue(0);
        }
    }
    /**
     * Returns the board value link to those player's scores
     * @param playerZeroScore the positive score of player zero
     * @param playerOneScore the positive score of player one
     */
    public static of(playerZeroScore: number, playerOneScore: number): BoardValue {
        playerZeroScore = playerZeroScore * Player.ZERO.getScoreModifier();
        playerOneScore = playerOneScore * Player.ONE.getScoreModifier();
        return new BoardValue(playerZeroScore + playerOneScore);
    }
    public toString(): string {
        return '' + this.value;
    }
    public constructor(public readonly value: number) {}
}
