import { Localized } from 'src/app/utils/LocaleUtils';

export class TutorialStepMessage {

    public static readonly YOU_DID_NOT_CAPTURE_ANY_PIECE: Localized = () => $localize`Failed, you did not capture any piece.`;

    public static readonly END_OF_THE_GAME: Localized = () => $localize`End of the game`;

    public static readonly CONGRATULATIONS: Localized = () => $localize`Congratulations!`;

    public static readonly CONGRATULATIONS_YOU_WON: Localized = () => $localize`Congratulations, you won!`;

    public static readonly FAILED_TRY_AGAIN: Localized = () => $localize`Failed, try again.`;
}
