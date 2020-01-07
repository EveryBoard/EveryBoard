import { EncapsuleCase } from "./EncapsulePartSlice";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";

export class EncapsuleLegalityStatus implements LegalityStatus {

    public legal: boolean;

    public newLandingCase: EncapsuleCase;
}