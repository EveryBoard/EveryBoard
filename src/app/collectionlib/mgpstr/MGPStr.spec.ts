import { MGPStr } from "./MGPStr";

describe('MGPStr', () => {

    it("Equals should recognize the variable first", () => {
        const stringUnderTest: MGPStr = new MGPStr("Salut putain");

        expect(stringUnderTest.equals(stringUnderTest)).toBeTruthy();
    });
    it("Equals should refuse object of wrong type then", () => {
        const content: String = "Salut putain";
        const stringUnderTest: MGPStr = new MGPStr(content);

        expect(stringUnderTest.equals(content)).toBeFalsy();
    });
});