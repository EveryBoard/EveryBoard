import { Player } from 'src/app/jscaip/Player';
import { TaflConfig } from '../TaflConfig';

export const tablutConfig: TaflConfig = {
    CASTLE_IS_LEFT_FOR_GOOD: false,
    BORDER_CAN_SURROUND_KING: true,
    CENTRAL_THRONE_CAN_SURROUND_KING: false,
    KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_SANDWICHED: false,
    WIDTH: 9,
    INVADER: Player.ZERO,
};
