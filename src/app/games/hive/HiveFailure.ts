import { Localized } from 'src/app/utils/LocaleUtils';

export class HiveFailure {

    public static readonly CANNOT_DROP_PIECE_YOU_DONT_HAVE: Localized = () => `You cannot drop a piece that you do not have in your reserve.`;

    public static readonly QUEEN_BEE_CAN_ONLY_MOVE_TO_DIRECT_NEIGHBORS: Localized = () => $localize`The queen bee can only move to one of its direct neighbors.`;

    public static readonly BEETLE_CAN_ONLY_MOVE_TO_DIRECT_NEIGHBORS: Localized = () => $localize`The beetle can only move to one of its direct neighbors.`;

    public static readonly GRASSHOPPER_MUST_MOVE_IN_STRAIGHT_LINE: Localized = () => $localize`The grasshopper must move in a straight line.`;

    public static readonly GRASSHOPPER_MUST_JUMP_OVER_PIECES: Localized = () => $localize`The grasshopper must jump over other pieces, without any empty spaces.`;

    public static readonly SPIDER_MUST_MOVE_ON_NEIGHBORING_SPACES: Localized = () => $localize`The spider must move on neighboring spaces.`;

    public static readonly SPIDER_CAN_ONLY_MOVE_WITH_DIRECT_CONTACT: Localized = () => $localize`The spider can only move around pieces that it is in direct contact with.`;

    public static readonly SPIDER_CANNOT_BACKTRACK: Localized = () => $localize`The spider cannot go twice through the same space in the same move.`;

    public static readonly QUEEN_BEE_MUST_BE_ON_BOARD_BEFORE_MOVE: Localized = () => $localize`The queen bee must be placed on the board before moving a piece.`;

    public static readonly THIS_PIECE_CANNOT_CLIMB: Localized = () => $localize`This piece is not allowed to climb over other pieces.`;

    public static readonly CANNOT_DISCONNECT_HIVE: Localized = () => $localize`You are not allowed to split the hive.`;

    public static readonly MUST_BE_ABLE_TO_SLIDE: Localized = () => $localize`This piece must be able to slide to its destination.`;

    public static readonly MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN: Localized = () => $localize`You must place your queen bee at this turn!`;

    public static readonly CANNOT_DROP_NEXT_TO_OPPONENT: Localized = () => $localize`You cannot drop a piece next to one of your opponent's stack.`;

    public static readonly MUST_DROP_ON_EMPTY_SPACE: Localized = () => $localize`You must always drop your piece on an empty space.`;

    public static readonly MUST_BE_CONNECTED_TO_HIVE: Localized = () => $localize`The piece you are dropping must be connected to the hive.`;

}
