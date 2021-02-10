import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

export class AwaleLegalityStatus implements LegalityStatus {
    public static failure(reason: string): AwaleLegalityStatus {
        return { legal: MGPValidation.failure(reason), captured: null, resultingBoard: null };
    }

    public legal: MGPValidation;

    public captured: number[];

    public resultingBoard: number[][];
}
