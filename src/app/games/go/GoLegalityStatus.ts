import { Coord } from "src/app/jscaip/Coord";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";

export class GoLegalityStatus implements LegalityStatus {

    public legal: boolean;

    public capturedCoords: Coord[];
}