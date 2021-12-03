import { Player } from 'src/app/jscaip/Player';


export interface TaflConfig {

    readonly CASTLE_IS_LEFT_FOR_GOOD: boolean;
    // once the king leave the castle he cannot re-station there
    readonly CAN_CAPTURE_KING_AGAINST_THRONE: boolean;
    // the throne is considered an opponent to the king
    readonly CAN_CAPTURE_PAWN_AGAINST_THRONE: boolean;
    // the throne is considered an opponent to the pawn
    readonly THREE_INVADERS_AND_A_BORDER_CAN_CAPTURE_KING: boolean;
    // the king can be captured by only three invaders if he's against the corner
    readonly THREE_INVADERS_AND_CENTRAL_THRONE_CAN_CAPTURE_KING: boolean;
    // the king can be captured by only three invaders if he's against a throne
    readonly KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_CAPTURED_NORMALLY: boolean;
    // the king can be captured by two invader when he don't touch a throne
    readonly WIDTH: number;

    readonly INVADER: Player;
}
