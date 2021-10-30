import { EncapsuleCase } from './EncapsuleState';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export class EncapsuleLegalityStatus implements LegalityStatus {
    public static failure(reason: string): EncapsuleLegalityStatus {
        return {
            legal: MGPValidation.failure(reason),
            newLandingCase: null,
        };
    }

    public legal: MGPValidation;

    public newLandingCase: EncapsuleCase | null;
}
