import { MGPValidation } from '@everyboard/lib';

import { Localized } from '../../../utils/LocaleUtils';
import { MGPValidator } from '../../../utils/MGPValidator';

import { ConfigLine } from './ConfigLine';


export class EnumConfig extends ConfigLine {

    public constructor(value: string,
                       title: Localized,
        public readonly possibleValues: { [key: string]: Localized },
        public readonly validator: MGPValidator = (_: string) => MGPValidation.SUCCESS) {
        super(value, title);
    }

    public override checkValidity(fieldValue: string): MGPValidation {
        if (typeof (fieldValue) !== 'string') {
            return MGPValidation.failure('EnumConfig expects a string value');
        } else if (Object.keys(this.possibleValues).indexOf(fieldValue) === -1) {
            return MGPValidation.failure('This value is not among the possible values');
        } else {
            return this.validator(fieldValue);
        }
    }
}
