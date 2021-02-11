import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { GipfPartSlice } from '../gipf-part-slice/GipfPartSlice';

export class GipfLegalityStatus implements LegalityStatus {
    public constructor(public readonly legal: MGPValidation, public readonly computedSlice?: GipfPartSlice) {
    }
}
