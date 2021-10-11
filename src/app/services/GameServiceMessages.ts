import { Localized } from '../utils/LocaleUtils';

export class GameServiceMessages {

    public static readonly ALREADY_INGAME: Localized = () => $localize`You are already in a game. Finish it or cancel it first.`;

    public static readonly USER_OFFLINE: Localized = () => $localize`You are offline. Log in to join a game.`;
}
