import { Sets } from "./Sets";
import { MGPStr } from "../mgpstr/MGPStr";

describe("Sets", () => {

    it("Should remove doublon with number", () => {
        const withDoublon: number[] = [0, 1, 2, 2];

        const asSet: number[] = Sets.toNumberSet(withDoublon);

        expect(asSet).toEqual([0, 1, 2]);
    });
    it("Should remove doublon with Comparable", () => {
        const withDoublon: MGPStr[] = [new MGPStr("salut"), new MGPStr("salut")];

        const asSet: MGPStr[] = Sets.toSet(withDoublon);

        expect(asSet).toEqual([new MGPStr("salut")]);
    });
});