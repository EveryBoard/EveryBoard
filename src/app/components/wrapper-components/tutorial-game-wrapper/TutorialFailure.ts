import { Localized } from 'src/app/utils/LocaleUtils';

export class TutorialFailure {

    public static readonly STEP_FINISHED: Localized = () => $localize`Step finished!`;

    public static readonly INFORMATIONAL_STEP: Localized = () => $localize`This step is not expecting any move from your part.`;
}
