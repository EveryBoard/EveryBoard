import { Utils } from 'src/app/utils/utils';
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
    public static ofSingle(playerZeroScore: number, playerOneScore: number): BoardValue {
        return BoardValue.ofMultiple([playerZeroScore], [playerOneScore]);
    }

    /**
     * Returns the board value link to those player's scores
     * @param playerZeroScores the positive score list of player zero
     * @param playerOneScores the positive score list of player one
     */
    public static ofMultiple(playerZeroScores: ReadonlyArray<number>, playerOneScores: ReadonlyArray<number>)
    : BoardValue
    {
        // TODO FOR REVIEW: non je voulais dire, si zero a [1, 2] mais un a [1], je considère que 1 a [1, 0] ???
        Utils.assert(playerZeroScores.length === playerOneScores.length, 'both player should have the same number of metric');
        Utils.assert(playerZeroScores.length >= 1, 'scores list should be filled');
        const subValues: number[] = [];
        for (let i: number = 0; i < playerZeroScores.length; i++) {
            const playerZeroScore: number = playerZeroScores[i] * Player.ZERO.getScoreModifier();
            const playerOneScore: number = playerOneScores[i] * Player.ONE.getScoreModifier();
            subValues.push(playerZeroScore + playerOneScore);
        }
        return new BoardValue(subValues);
    }

    public static of(value: number): BoardValue {
        return new BoardValue([value]);
    }

    public static multiMetric(value: ReadonlyArray<number>): BoardValue {
        return new BoardValue(value);
    }

    private constructor(public readonly value: ReadonlyArray<number>) {}
}
