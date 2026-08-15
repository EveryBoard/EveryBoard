import { JSONPrimitive, MGPValidation } from 'lib/dist';
import { ConfigDescriptionType } from 'src/app/jscaip/RulesConfigUtil';
import { Localized } from 'src/app/utils/LocaleUtils';


export abstract class ConfigLine {

    protected constructor(public readonly defaultValue: ConfigDescriptionType,
        public readonly title: Localized) {
    }

    // Should check if the value is valid
    public abstract checkValidity(value: JSONPrimitive): MGPValidation;

}
