import { AwaleRules } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwalePartSlice } from '../AwalePartSlice';

describe('AwaleRules', () => {
    let rules: AwaleRules;

    beforeEach(() => {
        rules = new AwaleRules(AwalePartSlice);
        AwaleRules.GET_BOARD_VALUE_CALL_COUNT = 0;
        AwaleRules.GET_LIST_MOVES_CALL_COUNT = 0;
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.choose(new AwaleMove(0, 0))).toBeTrue();
    });
    it('IA(depth=N) should create exactly as much descendant as it calculate their value, but not calculate listMove for last generation', () => {
        const previousGenerationsSizes: number[] = [0, 1, null, null, null, null];
        for (let i: number = 0; i<6; i++) {
            rules.node.findBestMoveAndSetDepth(i);
            const iGenerationsOfNode: number = rules.node.countDescendants();
            previousGenerationsSizes[i+1] = iGenerationsOfNode;
            expect(AwaleRules.GET_BOARD_VALUE_CALL_COUNT).toEqual(iGenerationsOfNode);
        }
        rules = new AwaleRules(AwalePartSlice);
        AwaleRules.GET_BOARD_VALUE_CALL_COUNT = 0;
        AwaleRules.GET_LIST_MOVES_CALL_COUNT = 0;
        for (let i: number = 1; i<6; i++) {
            rules.node.findBestMoveAndSetDepth(i);
            expect(AwaleRules.GET_LIST_MOVES_CALL_COUNT).toEqual(previousGenerationsSizes[i] + 1);
        }
    });
});
