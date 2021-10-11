import { Localized } from 'src/app/utils/LocaleUtils';

export class SaharaFailure {

    public static readonly CAN_ONLY_REBOUND_ON_BLACK: Localized = () => $localize`You can only rebound on dark spaces.`;

    public static readonly CAN_ONLY_REBOUND_ON_EMPTY_SPACE: Localized = () => $localize`You can only rebound on empty spaces.`;

    public static readonly MUST_CHOOSE_PYRAMID_FIRST: Localized = () => $localize`You must pick one of your pyramids first.`;

    public static readonly MUST_CHOOSE_OWN_PYRAMID: Localized = () => $localize`You must pick one of your pyramids.`;
}
