import { JSONValue } from '@everyboard/lib';

export type BotIdentifier = {
    readonly displayName: string;
    readonly parameters: JSONValue;
};
