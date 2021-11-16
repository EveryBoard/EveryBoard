import { EncapsuleCase } from './EncapsuleState';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class EncapsuleLegalityStatus implements LegalityStatus {
    public static failure(reason: string): EncapsuleLegalityStatus {
        return {
            legal: MGPValidation.failure(reason),
            newLandingCase: MGPOptional.empty(),
        };
    }

    public legal: MGPValidation;

    public newLandingCase: MGPOptional<EncapsuleCase>;
}
