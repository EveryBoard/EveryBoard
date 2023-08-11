import { Localized } from 'src/app/utils/LocaleUtils';

export class MancalaFailure {

    public static MUST_DISTRIBUTE_YOUR_OWN_HOUSES: Localized = () => $localize`You must distribute one of your houses.`;

    public static MUST_CHOOSE_NON_EMPTY_HOUSE: Localized = () => $localize`You should choose a non-empty house to distribute.`;

    public static SHOULD_DISTRIBUTE: Localized = () => $localize`You should distribute but you do not.`;
}
