import { Localized } from '../utils/LocaleUtils';

export class RulesFailure {

    public static readonly MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT: Localized = () => $localize`You have selected a piece of the opponent. You must pick one of your pieces.`;

    public static readonly MUST_CHOOSE_OWN_PIECE_NOT_EMPTY: Localized = () => $localize`You have selected an empty space, you must select one of your own pieces.`;

    public static readonly MUST_CLICK_ON_EMPTY_SPACE: Localized = () => $localize`You must click on an empty space.`;

    public static readonly MUST_CLICK_ON_EMPTY_SQUARE: Localized = () => $localize`You must click on an empty square.`;

    public static readonly SHOULD_LAND_ON_EMPTY_OR_OPPONENT_SPACE: Localized = () => $localize`Your landing space should be empty or contain a piece of the opponent.`;

    public static readonly CANNOT_SELF_CAPTURE: Localized = () => $localize`You cannot capture your own pieces.`;

    public static readonly CANNOT_PASS: Localized = () => $localize`You cannot pass your turn.`;

    public static readonly MUST_LAND_ON_EMPTY_SPACE: Localized = () => $localize`You must drop your piece on an empty space.`;

    public static readonly MUST_PASS: Localized = () => $localize`You must pass your turn.`;

    public static readonly MOVE_CANNOT_BE_STATIC: Localized = () => $localize`You must choose different starting and ending coordinates.`;

    public static readonly SOMETHING_IN_THE_WAY: Localized = () => $localize`There is a piece between the piece you chose and its landing space.`;

    public static readonly MUST_MOVE_ON_NEIGHBOR: Localized = () => $localize`You must move on a direct neighboring space.`;

}
