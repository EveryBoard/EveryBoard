import { MGPValidation } from './MGPValidation';

export type MGPValidator = (v: number | null) => MGPValidation;

export class MGPValidators {

    public static range(min: number, max: number): MGPValidator {
        return (value: number | null) => {
            if (value == null) {
                return MGPValidation.failure($localize`Value is mandatory`);
            }
            if (value < min) {
                return MGPValidation.failure($localize`${ value } is too low, minimum is ${ min }`);
            } else if (max < value) {
                return MGPValidation.failure($localize`${ value } is too high, maximum is ${ max }`);
            } else {
                return MGPValidation.SUCCESS;
            }
        };
    }
}
