import { AwaleRules } from './AwaleRules';
import { AwaleMove } from '../awalemove/AwaleMove';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { AwalePartSlice } from '../AwalePartSlice';

describe('AwaleRules', () => {

    let rules: AwaleRules;

    beforeAll(() => {
        AwaleRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || AwaleRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new AwaleRules(AwalePartSlice);
        AwaleRules.GET_BOARD_VALUE_CALL_COUNT = 0;
        AwaleRules.GET_LIST_MOVES_CALL_COUNT = 0;
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.choose(new AwaleMove(0, 0))).toBeTruthy();
    });
    it('IA(depth=N) should create exactly as much descendant as it calculate their value, but not calculate listMove for last generation', () => {
        const previousGenerationsSizes: number[] = [0, 1, null, null, null, null];
        for (let i = 0; i<6; i++) {
            rules.node.findBestMoveAndSetDepth(i);
            let iGenerationsOfNode = rules.node.countDescendants();
            previousGenerationsSizes[i+1] = iGenerationsOfNode;
            expect(AwaleRules.GET_BOARD_VALUE_CALL_COUNT).toEqual(iGenerationsOfNode);
        };
        rules = new AwaleRules(AwalePartSlice);
        AwaleRules.GET_BOARD_VALUE_CALL_COUNT = 0;
        AwaleRules.GET_LIST_MOVES_CALL_COUNT = 0;
        for (let i = 1; i<6; i++) {
            rules.node.findBestMoveAndSetDepth(i);
            expect(AwaleRules.GET_LIST_MOVES_CALL_COUNT).toEqual(previousGenerationsSizes[i] + 1);
        };
    });
});