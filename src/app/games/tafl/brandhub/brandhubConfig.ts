import { Player } from 'src/app/jscaip/Player';
import { TaflConfig } from '../TaflConfig';

export const brandhubConfig: TaflConfig = {

    CASTLE_IS_LEFT_FOR_GOOD: true,

    NORMAL_CAPTURE_WORK_ON_THE_KING: false,

    CAN_CAPTURE_KING_AGAINST_THRONE: true,

    CAN_CAPTURE_PAWN_AGAINST_THRONE: true,

    THREE_INVADERS_AND_A_BORDER_CAN_CAPTURE_KING: true,

    KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_CAPTURED_NORMALLY: true,

    WIDTH: 7,

    INVADER: Player.ZERO,
};
