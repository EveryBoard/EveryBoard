import { JSONPrimitive, MGPValidation } from 'lib/dist';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPValidator } from 'src/app/utils/MGPValidator';

import { ConfigLine } from './ConfigLine';


export class NumberConfig extends ConfigLine {

    public constructor(defaultValue: number,
                       title: Localized,
        public readonly validator: MGPValidator) {
        super(defaultValue, title);
    }

    public checkValidity(value: JSONPrimitive): MGPValidation {
        if (typeof (value) === 'number') {
            return this.validator(value);
        } else {
            return MGPValidation.failure('NumberConfig expects a number value');
        }
    }

}
