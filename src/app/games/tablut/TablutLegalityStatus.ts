import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

export class TablutLegalityStatus implements LegalityStatus {
    legal: MGPValidation;

    resultingBoard: number[][];
}
