import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export class PentagoLegalityStatus implements LegalityStatus {

    private constructor(public legal: MGPValidation) {}

    public static failure(reason: string): PentagoLegalityStatus {
        return new PentagoLegalityStatus(MGPValidation.failure(reason));
    }
    public static SUCCESS: PentagoLegalityStatus = new PentagoLegalityStatus(MGPValidation.SUCCESS);
}
