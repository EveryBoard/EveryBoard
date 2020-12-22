import {MGPValidation} from 'src/app/collectionlib/mgpvalidation/MGPValidation';
import {Coord} from 'src/app/jscaip/coord/Coord';
import {LegalityStatus} from 'src/app/jscaip/LegalityStatus';

export class ReversiLegalityStatus implements LegalityStatus {
    public legal: MGPValidation;

    public switched: Coord[];
}
