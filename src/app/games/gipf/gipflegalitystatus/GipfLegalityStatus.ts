import { MGPValidation } from "src/app/collectionlib/mgpvalidation/MGPValidation";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";
import { GipfPartSlice } from "../gipfpartslice/GipfPartSlice";

export class GipfLegalityStatus implements LegalityStatus {
    public constructor(public readonly legal: MGPValidation, public readonly computedSlice?: GipfPartSlice) {
    }
}
