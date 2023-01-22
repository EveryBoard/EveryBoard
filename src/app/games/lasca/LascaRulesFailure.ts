import { Localized } from 'src/app/utils/LocaleUtils';


export class LascaRulesFailure {

    public static readonly CANNOT_GO_BACKWARD: Localized = () => $localize`You cannot go backward with normal pieces!`;

    public static readonly CANNOT_CAPTURE_EMPTY_SPACE: Localized = () => $localize`You cannot capture an empty square, nor jump over it!`;

    public static readonly CANNOT_SKIP_CAPTURE: Localized = () => $localize`You must capture when it is possible!`;

    public static readonly MUST_FINISH_CAPTURING: Localized = () => $localize`You must finish this capture!`;
}
