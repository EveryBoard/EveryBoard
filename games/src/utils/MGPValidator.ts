import { MGPValidation } from '@everyboard/lib';

// TODO FOR REVIEW: Pourquoi la baise nest ce pas dans lib ?
export type MGPValidator = (v: number | string | null) => MGPValidation;

export class MGPValidators {

    public static range(min: number, max: number): MGPValidator {
        return (value: number) => {
            if (value < min) {
                return MGPValidation.failure(MGPValidatorsFailure.VALUE_IS_TOO_SMALL(value, min));
            } else if (max < value) {
                return MGPValidation.failure(MGPValidatorsFailure.VALUE_IS_TOO_HIGH(value, max));
            } else {
                return MGPValidation.SUCCESS;
            }
        };
    }
}

export class MGPValidatorsFailure {

    public static readonly VALUE_IS_TOO_SMALL: (value: number, minimum: number) => string = (v: number, m: number) => $localize`${ v } is too small, the minimum is ${ m }`;

    public static readonly VALUE_IS_TOO_HIGH: (value: number, maximum: number) => string = (v: number, m: number) => $localize`${ v } is too big, the maximum is ${ m }`;
}
