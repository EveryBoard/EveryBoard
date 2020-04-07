import { EncapsuleRules } from "./EncapsuleRules";

describe('EncapsuleRules', () => {

    let rules: EncapsuleRules;

    beforeEach(() => {
        rules = new EncapsuleRules();
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
});