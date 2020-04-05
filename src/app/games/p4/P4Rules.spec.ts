import {P4Rules} from './P4Rules';
import {MoveX} from '../../jscaip/MoveX';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('P4Rules', () => {

    let rules: P4Rules;

    beforeAll(() => {
        P4Rules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(() => {
        rules = new P4Rules();
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('Empty board should be worth 0 (true neutral)', () => {
        expect(rules.getBoardValue(rules.node)).toEqual(0);
    });
    it('First player should win vertically', () => {
        rules.choose(MoveX.get(3));
        rules.choose(MoveX.get(2));
        rules.choose(MoveX.get(3));
        rules.choose(MoveX.get(2));
        rules.choose(MoveX.get(3));
        rules.choose(MoveX.get(2));
        rules.choose(MoveX.get(3));
        expect(rules.getBoardValue(rules.node)).toEqual(Number.MIN_SAFE_INTEGER);
    });
    it('Second player should win vertically', () => {
        rules.choose(MoveX.get(0));
        rules.choose(MoveX.get(3));
        rules.choose(MoveX.get(2));
        rules.choose(MoveX.get(3));
        rules.choose(MoveX.get(2));
        rules.choose(MoveX.get(3));
        rules.choose(MoveX.get(2));
        rules.choose(MoveX.get(3));
        expect(rules.getBoardValue(rules.node)).toEqual(Number.MAX_SAFE_INTEGER);
    });
    it('Should be an unfinished game', () => {
        rules.choose(MoveX.get(3));
        rules.choose(MoveX.get(3));

        rules.choose(MoveX.get(2)); // two in a line
        rules.choose(MoveX.get(1)); // left block

        rules.choose(MoveX.get(4)); // three in a line
        rules.choose(MoveX.get(5)); // right block

        rules.choose(MoveX.get(5)); // start over and don't win
        expect(rules.getBoardValue(rules.node)).toBeLessThan(Number.MAX_SAFE_INTEGER);
    });
    it('Should be an unfinished game', () => {
        rules.choose(MoveX.get(3));
        rules.choose(MoveX.get(3));

        rules.choose(MoveX.get(2)); // two in a line
        rules.choose(MoveX.get(1)); // left block

        rules.choose(MoveX.get(4)); // three in a line
        rules.choose(MoveX.get(5)); // right block

        rules.choose(MoveX.get(1)); // start over another pawn and don't win
        expect(rules.getBoardValue(rules.node)).toBeLessThan(Number.MAX_SAFE_INTEGER);
    });
});