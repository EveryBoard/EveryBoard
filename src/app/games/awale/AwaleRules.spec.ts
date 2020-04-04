import {AwaleRules} from './AwaleRules';
import { AwaleMove } from './AwaleMove';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('AwaleRules', () => {

    let rules: AwaleRules;

    beforeAll(() => {
        AwaleRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(() => {
        rules = new AwaleRules();
        AwaleRules.GET_BOARD_VALUE_CALL_COUNT = 0;
        AwaleRules.GET_LIST_MOVES_CALL_COUNT = 0;
    });
    let previousGenerationsSizes: number[] = [0, 1, null, null, null, null];

    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.choose(new AwaleMove(0, 0))).toBeTruthy();
    });
    it('IA(depth=N) should create exactly as much descendant as it calculate their value', () => {
        for (let i = 0; i<6; i++) {
            rules.node.findBestMoveAndSetDepth(i);
            let iGenerationsOfNode = rules.node.countDescendants();
            previousGenerationsSizes[i+1] = iGenerationsOfNode;
            expect(AwaleRules.GET_BOARD_VALUE_CALL_COUNT).toEqual(iGenerationsOfNode);
        };
    });
    it('IA(depth=N) should calculate list moves for only N-1 generations', () => {
        for (let i = 1; i<6; i++) {
            rules.node.findBestMoveAndSetDepth(i);
            expect(AwaleRules.GET_LIST_MOVES_CALL_COUNT).toEqual(previousGenerationsSizes[i] + 1);
        };
    });
});