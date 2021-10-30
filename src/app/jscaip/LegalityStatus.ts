import { MGPValidation } from '../utils/MGPValidation';

export class LegalityStatus {

    protected constructor(public readonly legal: MGPValidation) {}

    public static failure(reason: string): LegalityStatus {
        return new LegalityStatus(MGPValidation.failure(reason));
    }
    public static SUCCESS: LegalityStatus = new LegalityStatus(MGPValidation.SUCCESS);
}
