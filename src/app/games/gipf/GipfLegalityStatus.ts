import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { GipfPartSlice } from './GipfPartSlice';

export class GipfLegalityStatus implements LegalityStatus {
    public constructor(public readonly legal: MGPValidation, public readonly computedSlice?: GipfPartSlice) {
    }
}
