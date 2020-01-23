import { LegalityStatus } from "src/app/jscaip/LegalityStatus";

export class SiamLegalityStatus implements LegalityStatus {

    public legal: boolean;

    public resultingBoard: number[][];
}