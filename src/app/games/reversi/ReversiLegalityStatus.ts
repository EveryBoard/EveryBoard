import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

export class ReversiLegalityStatus implements LegalityStatus {
    public legal: MGPValidation;

    public switched: Coord[] | null;
}
