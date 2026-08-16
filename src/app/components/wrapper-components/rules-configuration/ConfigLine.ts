import { JSONPrimitive, MGPValidation } from '@everyboard/lib';

import { ConfigDescriptionType } from '../../../jscaip/RulesConfigUtil';
import { Localized } from '../../../utils/LocaleUtils';


export abstract class ConfigLine {

    protected constructor(
        public readonly defaultValue: ConfigDescriptionType,
        public readonly title: Localized,
    ) {}

    // Should check if the value is valid
    public abstract checkValidity(value: JSONPrimitive): MGPValidation;

}
