import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { NewGameMove } from '../NewGameMove';
import { NewGameConfig, NewGameNode, NewGameRules } from '../NewGameRules';
import { NewGameState } from '../NewGameState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { ConfigLine } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';

/**
 * This is the test suite for the rules
 */
describe('NewGameRules', () => {

    let rules: NewGameRules;
    const defaultConfig: MGPOptional<NewGameConfig> = NewGameRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        // This is the rules instance that we will test
        rules = NewGameRules.get();
    });

    it('should adhere to some rule', () => {
        // This is how you would test a particular rule:

        // Given a state
        const state: NewGameState = NewGameRules.get().getInitialState();

        // When doing some move
        const move: NewGameMove = new NewGameMove();

        // Then it should succeed (or fail)
        const expectedState: NewGameState = new NewGameState(1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should be a draw', () => {
        // This is how you would test the game status computation:

        // Given some state
        const state: NewGameState = new NewGameState(42);
        // When checking its status
        // Then it should be a draw
        const node: NewGameNode = new NewGameNode(state);
        RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        // Or you could use this
        // RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
    });

    it('Should have valid ConfigLine ou quoi que ce soye !', () => {
        // For coverage
        // eslint-disable-next-line max-len
        const fieldUnderTest: ConfigLine = NewGameRules.RULES_CONFIG_DESCRIPTION.defaultConfigDescription.config.the_name_you_will_use_in_your_rules_and_states;
        expect(Utils.getNonNullable(fieldUnderTest.validator)(null)).toBeTruthy();
    });

});
