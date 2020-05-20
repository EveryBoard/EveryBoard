import { Coord } from "src/app/jscaip/Coord";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";

export class GoLegalityStatus implements LegalityStatus {

    public static readonly ILLEGAL: GoLegalityStatus = {legal: false, capturedCoords: null};

    public legal: boolean;

    public capturedCoords: Coord[];
}