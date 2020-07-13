import { EncapsuleRules } from "./EncapsuleRules";
import { EncapsuleMove } from "../encapsulemove/EncapsuleMove";
import { EncapsulePiece } from "../EncapsuleEnums";
import { Coord } from "src/app/jscaip/Coord";

describe('EncapsuleRules', () => {

    let rules: EncapsuleRules;

    beforeEach(() => {
        rules = new EncapsuleRules();
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('should allow simple move', () => {
        const firstMove: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(1, 1));
        expect(rules.choose(firstMove)).toBeTruthy();
    });
});