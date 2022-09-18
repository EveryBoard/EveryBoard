import { Player } from 'src/app/jscaip/Player';
import { TaflConfig } from '../TaflConfig';

export const brandhubConfig: TaflConfig = {

    CASTLE_IS_LEFT_FOR_GOOD: true,

    BORDER_CAN_SURROUND_KING: false,

    CENTRAL_THRONE_CAN_SURROUND_KING: true,

    KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_SANDWICHED: true,

    WIDTH: 7,

    INVADER: Player.ZERO,
};
