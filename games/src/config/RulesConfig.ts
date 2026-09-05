/* eslint-disable no-multi-spaces */
import { MGPValidation } from '@everyboard/lib';

import { Localized } from '../utils/LocaleUtils';

import { ConfigLine } from './ConfigLine';

export type ConfigDescriptionType = number | boolean | string;

export type NamedRulesConfig<R extends RulesConfig = EmptyRulesConfig> = {
    config: R;
    name: Localized;
};

export type DefaultConfigDescription<R extends RulesConfig = EmptyRulesConfig> = {
    name: Localized;
    config: Record<keyof R, ConfigLine>;
    validators?: ((config: R) => MGPValidation)[];
}

export type RulesConfig = {
    [member: string]: ConfigDescriptionType;
}

export type EmptyRulesConfig = Record<string, never>;
