import { MGPValidation } from '@everyboard/lib';
import { EmptyRulesConfig, RulesConfig } from '../jscaip/RulesConfigUtil';

// This type of validator includes a second param: the new global config
// This allows us to check that the change to field "v" is
// 1. valid locally (not too big, not too small, not even, things like that)
// 2. valid globally (v and those two other fields cannot have the same value, their sum must be 10, things like that)
export type MGPValidator<R extends RulesConfig = EmptyRulesConfig> =
(v: number | string | null, config: R) => MGPValidation;

export class MGPValidators {

    public static range<R extends RulesConfig = EmptyRulesConfig>(min: number, max: number): MGPValidator<R> {
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
