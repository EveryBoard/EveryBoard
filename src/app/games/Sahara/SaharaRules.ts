import { Rules } from "src/app/jscaip/Rules";
import { Move } from "src/app/jscaip/Move";
import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";
import { MNode } from "src/app/jscaip/MNode";
import { MGPMap } from "src/app/collectionlib/MGPMap";

export class SaharaMove extends Move {

    public toString(): String {
        throw new Error("Method not implemented.");
    }
    public equals(o: any): boolean {
        throw new Error("Method not implemented.");
    }
    public encode(): number {
        throw new Error("Method not implemented.");
    }
    public decode(encodedMove: number): Move {
        throw new Error("Method not implemented.");
    }
}
export class SaharaPartSlice extends GamePartSlice {

}
export class SaharaLegality implements LegalityStatus {
    legal: boolean;

}
export class SaharaRules extends Rules<SaharaMove, SaharaPartSlice, SaharaLegality> {

    public getListMoves(node: MNode<Rules<SaharaMove, SaharaPartSlice, SaharaLegality>, SaharaMove, SaharaPartSlice, SaharaLegality>): MGPMap<SaharaMove, SaharaPartSlice> {
        throw new Error("Method not implemented.");
    }
    public getBoardValue(node: MNode<Rules<SaharaMove, SaharaPartSlice, SaharaLegality>, SaharaMove, SaharaPartSlice, SaharaLegality>): number {
        throw new Error("Method not implemented.");
    }
    public applyLegalMove(move: SaharaMove, slice: SaharaPartSlice, status: SaharaLegality): { resultingMove: SaharaMove; resultingSlice: SaharaPartSlice; } {
        throw new Error("Method not implemented.");
    }
    public isLegal(move: SaharaMove, slice: SaharaPartSlice): SaharaLegality {
        throw new Error("Method not implemented.");
    }
    public setInitialBoard(): void {
        throw new Error("Method not implemented.");
    }
}