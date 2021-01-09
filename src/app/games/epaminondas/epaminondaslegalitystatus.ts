import { MGPValidation } from "src/app/collectionlib/mgpvalidation/MGPValidation";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";

export class EpaminondasLegalityStatus implements LegalityStatus {

    public static failure(reason: string): EpaminondasLegalityStatus {
        return {legal: MGPValidation.failure(reason), newBoard: null};
    }
    public legal: MGPValidation;

    public newBoard: number[][];
}
