import { MGPFallible } from './MGPFallible';

export type MGPValidation = MGPFallible<void>

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace MGPValidation {

    export const SUCCESS: MGPValidation = MGPFallible.success(undefined);

    export function ofFallible<T>(fallible: MGPFallible<T>): MGPValidation {
        if (fallible.isSuccess()) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(fallible.getReason());
        }
    }

    export function failure(reason: string): MGPValidation {
        return MGPFallible.failure(reason);
    }
}
