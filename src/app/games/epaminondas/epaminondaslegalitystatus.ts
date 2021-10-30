import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';

export class EpaminondasLegalityStatus implements LegalityStatus {

    public static failure(reason: string): EpaminondasLegalityStatus {
        return {
            legal: MGPValidation.failure(reason),
            newBoard: null,
        };
    }
    public legal: MGPValidation;

    public newBoard: Player[][] | null;
}
