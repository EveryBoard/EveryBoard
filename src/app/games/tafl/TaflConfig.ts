import { Player } from 'src/app/jscaip/Player';

/**
 * Terminology:
 *     - Surrounding: means capturing with 4 enemies (being border, opponent, or throne)
 *     - sandwiching: means capturing with 2 enemies (being border, opponent, or throne)
 */
export interface TaflConfig {

    readonly CASTLE_IS_LEFT_FOR_GOOD: boolean;
    // once the king leave the castle he cannot re-station there
    readonly THRONE_CAN_SURROUND_KING: boolean;
    // the throne is considered an opponent to the king
    readonly CAN_SANDWICH_PAWN_AGAINST_THRONE: boolean;
    // the throne is considered an opponent to the pawn
    readonly BORDER_CAN_SURROUND_KING: boolean;
    // A border can be counted as participating to a 4-enemy capture
    readonly CENTRAL_THRONE_CAN_SURROUND_KING: boolean;
    // the king can be captured by only three invaders if he's against a throne
    readonly KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_SANDWICHED: boolean;
    // the king can be captured by two invader when he don't touch a throne
    readonly WIDTH: number;

    readonly INVADER: Player;
}
