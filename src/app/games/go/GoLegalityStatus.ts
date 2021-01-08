import { MGPValidation } from "src/app/collectionlib/mgpvalidation/MGPValidation";
import { Coord } from "src/app/jscaip/coord/Coord";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";

export class GoLegalityStatus implements LegalityStatus {

    public static failure(reason: string): GoLegalityStatus {
        return {legal: MGPValidation.failure(reason), capturedCoords: null};
    }

    public legal: MGPValidation;

    public capturedCoords: Coord[];
}
