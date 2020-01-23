import { LegalityStatus } from "src/app/jscaip/LegalityStatus";

export class AwaleLegalityStatus implements LegalityStatus {

    public legal: boolean;

    public captured: number[];

    public resultingBoard: number[][];
}