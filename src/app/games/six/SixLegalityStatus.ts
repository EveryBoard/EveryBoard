import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

export interface SixLegalityStatus extends LegalityStatus {

    legal: MGPValidation;

    kept: MGPSet<Coord>;
}
