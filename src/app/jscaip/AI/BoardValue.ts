import { ArrayUtils, Utils } from '@everyboard/lib';

import { Player } from '../Player';
import { PlayerNumberMap } from '../PlayerMap';

export class BoardValue {

    public static max(left: BoardValue, right: BoardValue): BoardValue {
        const max: readonly number[] = ArrayUtils.max(left.metrics, right.metrics);
        return BoardValue.multiMetric(max);
    }

    public static min(left: BoardValue, right: BoardValue): BoardValue {
        const min: readonly number[] = ArrayUtils.min(left.metrics, right.metrics);
        return BoardValue.multiMetric(min);
    }

    public static VICTORIES: number[] = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];

    public static isVictory(score: number): boolean {
        return score === Number.POSITIVE_INFINITY || score === Number.NEGATIVE_INFINITY;
    }

    public static isPreVictory(score: number): boolean {
        return score === Number.POSITIVE_INFINITY - 1 || score === Number.NEGATIVE_INFINITY + 1;
    }

    /**
     * return the board value corresponding to the players' scores
     * @param playerZeroScore the positive score of player zero
     * @param playerOneScore the positive score of player one
     */
    public static ofSingle(playerZeroScore: number, playerOneScore: number): BoardValue {
        return BoardValue.ofMultiple([playerZeroScore], [playerOneScore]);
    }

    /**
     * return the board value corresponding to the players' scores, as a number map
     */
    public static ofPlayerNumberMap(map: PlayerNumberMap): BoardValue {
        return BoardValue.ofSingle(map.get(Player.ZERO), map.get(Player.ONE));
    }

    /**
     * return the board value corresponding to the players' scores
     * @param playerZeroScores the positive score list of player zero
     * @param playerOneScores the positive score list of player one
     */
    public static ofMultiple(playerZeroScores: ReadonlyArray<number>, playerOneScores: ReadonlyArray<number>)
    : BoardValue
    {
        Utils.assert(playerZeroScores.length === playerOneScores.length, 'both player should have the same number of metric');
        Utils.assert(playerZeroScores.length !== 0, 'scores list should not be empty');
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

    public static multiMetric(metrics: ReadonlyArray<number>): BoardValue {
        return new BoardValue(metrics);
    }

    public static isLessThan(left: BoardValue, right: BoardValue): boolean {
        return ArrayUtils.isLessThan(left.metrics, right.metrics);
    }

    public static isGreaterThan(left: BoardValue, right: BoardValue): boolean {
        return ArrayUtils.isGreaterThan(left.metrics, right.metrics);
    }

    private constructor(public readonly metrics: ReadonlyArray<number>) {}

    public toMaximum(): BoardValue {
        const size: number = this.metrics.length;
        const maximums: number[] = ArrayUtils.create(size, Number.POSITIVE_INFINITY);
        return BoardValue.multiMetric(maximums);
    }

    public toMinimum(): BoardValue {
        const size: number = this.metrics.length;
        const minimums: number[] = ArrayUtils.create(size, Number.NEGATIVE_INFINITY);
        return BoardValue.multiMetric(minimums);
    }

    public equals(other: BoardValue): boolean {
        return ArrayUtils.equals(this.metrics, other.metrics);
    }

}
