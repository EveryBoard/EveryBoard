import { Player } from 'src/app/jscaip/Player';
import { TaflConfig } from '../TaflConfig';

export const tablutConfig: TaflConfig = {

    CASTLE_IS_LEFT_FOR_GOOD: false,

    NORMAL_CAPTURE_WORK_ON_THE_KING: false,

    CAN_CAPTURE_KING_AGAINST_THRONE: false,

    CAN_CAPTURE_PAWN_AGAINST_THRONE: true,

    THREE_INVADERS_AND_A_BORDER_CAN_CAPTURE_KING: true,

    KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_CAPTURED_NORMALLY: false,

    WIDTH: 9,

    INVADER: Player.ZERO,
};
