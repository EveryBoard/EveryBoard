import { JSONPrimitive, MGPValidation } from 'lib/dist';
import { Localized } from 'src/app/utils/LocaleUtils';

import { ConfigLine } from './ConfigLine';


export class BooleanConfig extends ConfigLine {

    public constructor(defaultValue: boolean, title: Localized) {
        super(defaultValue, title);
    }

    public checkValidity(value: JSONPrimitive): MGPValidation {
        if (typeof (value) === 'boolean') {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('BooleanConfig expects a boolean value');
        }
    }

}
