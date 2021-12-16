import { Player } from 'src/app/jscaip/Player';

/**
 * Terminology:
 *     - surrounding: means capturing with 4 enemies (being border, opponent, or throne)
 *     - sandwiching: means capturing with 2 enemies (being border, opponent, or throne)
 */
export interface TaflConfig {

    // once the king leave the castle he cannot re-station there
    readonly CASTLE_IS_LEFT_FOR_GOOD: boolean;
    // a border can be counted as participating to a 4-opponent capture
    readonly BORDER_CAN_SURROUND_KING: boolean;
    // the king can be captured by only three invaders if he's against a throne
    readonly CENTRAL_THRONE_CAN_SURROUND_KING: boolean;
    // the king can be captured by two invaders when he doesn't touch a throne
    readonly KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_SANDWICHED: boolean;

    readonly WIDTH: number;

    readonly INVADER: Player;
}
