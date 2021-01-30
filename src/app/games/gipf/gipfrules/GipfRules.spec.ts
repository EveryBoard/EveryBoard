import { Coord } from "src/app/jscaip/coord/Coord";
import { HexaBoard } from "src/app/jscaip/hexa/HexaBoard";
import { GipfPartSlice } from "../gipfpartslice/GipfPartSlice";
import { GipfPiece } from "../gipfpiece/GipfPiece";
import { GipfRules } from "./GipfRules";

describe('GipfRules:', () => {
    let rules: GipfRules;

    beforeEach(() => {
        rules = new GipfRules(GipfPartSlice);
    })
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, 'Game should start at turn 0');
    });
    it('should start with an empty board', () => {
        const slice: GipfPartSlice = rules.node.gamePartSlice;
        const board: HexaBoard<GipfPiece> = slice.hexaBoard;
        board.forEachCoord((_: Coord, content: GipfPiece) => {
            expect(content).toEqual(GipfPiece.EMPTY);
        });
    });
});
