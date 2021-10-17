import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { YinshState } from './YinshState';

export class YinshLegalityStatus implements LegalityStatus {
    public constructor(public readonly legal: MGPValidation, public readonly computedState?: YinshState) {
    }
}
