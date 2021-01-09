import { EpaminondasPartSlice } from "../epaminondaspartslice/EpaminondasPartSlice";
import { EpaminondasRules } from "./EpaminondasRules";

describe('Epaminondas Minimax:', () => {

    let rules: EpaminondasRules;

    beforeEach(() => {
        rules = new EpaminondasRules(EpaminondasPartSlice);
    });
    it("Should propose 114 moves at first turn", () => {
        expect(rules.getListMoves(rules.node).size()).toBe(114);
    });
});