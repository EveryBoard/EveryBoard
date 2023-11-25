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
        Utils.assert(playerZeroScores.length === playerOneScores.length, 'both player should have the same number of metric');
        // TODO FOR REVIEW: or do we prefer to assume that it's 0 if it is not provided ?
        const subValues: number[] = [];
        for (let i: number = 0; i < playerZeroScores.length; i++) {
            const playerZeroScore: number = playerZeroScores[i] * Player.ZERO.getScoreModifier();
            const playerOneScore: number = playerOneScores[i] * Player.ONE.getScoreModifier();
            subValues.push(playerZeroScore + playerOneScore);
        }
        return new BoardValue(subValues);
    }

    public constructor(public readonly value: ReadonlyArray<number>) {}
}
