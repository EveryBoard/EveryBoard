import { Player } from '../Player';

export class BoardValue {

    public static VICTORIES: number[] = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];

    public static isVictory(score: number): boolean {
        return score === Number.MAX_SAFE_INTEGER || score === Number.MIN_SAFE_INTEGER;
    }
    public static isPreVictory(score: number): boolean {
        return score === Number.MAX_SAFE_INTEGER - 1 || score === Number.MIN_SAFE_INTEGER + 1;
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
    public constructor(private readonly value: number) {}
}
