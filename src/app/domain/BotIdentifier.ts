import { JSONValue } from '@everyboard/lib';

import { MinimalUser } from './MinimalUser';

export type BotIdentifier = {
    readonly displayName: string;
    readonly parameters: JSONValue;
};

export function getUserDisplayName(user: MinimalUser, botIdentifier: BotIdentifier | null): string {
    return botIdentifier?.displayName ?? user.name;
}
