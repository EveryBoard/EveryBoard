import { Localized } from 'src/app/utils/LocaleUtils';

export class AwaleFailure {
    public static CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME: Localized = () => $localize`You cannot distribute from the opponent's home.`;

    public static MUST_CHOOSE_NONEMPTY_HOUSE: Localized = () => $localize`You should choose a non-empty house to distribute.`;

    public static SHOULD_DISTRIBUTE: Localized = () => $localize`You should distribute but you do not.`;
}
