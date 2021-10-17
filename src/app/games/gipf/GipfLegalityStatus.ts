import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { GipfState } from './GipfState';

export class GipfLegalityStatus implements LegalityStatus {

    public constructor(public readonly legal: MGPValidation, public readonly computedState?: GipfState) {
    }
}
