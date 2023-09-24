import { MGPValidators, RulesConfigDescription } from 'src/app/components/normal-component/pick-game/pick-game.component';

// Note: RulesConfigDescriptions object are right now centralised in RulesConfigDescriptions
export const newRulesConfigDescription: RulesConfigDescription =
    new RulesConfigDescription({
        name: () => 'the internationalisable name of that standard config',
        config: {
            the_name_you_will_use_in_your_rules_and_states: 5,
        },
    }, {
        the_name_you_will_use_in_your_rules_and_states: () => `the translatable and writable name of this parameter`,
    }, [
        // OTHER DEFAULT CONFIGS TODO
    ], {
        the_name_you_will_use_in_your_rules_and_states: MGPValidators.range(1, 2), // TODO EXPLAIN
    });
            // isValid: (value: number | null): MGPValidation => {
                // return MGPValidation.failure('Return a localizable message saying why this config choice is unacceptable');
            // },

newRulesConfigDescription.getDefaultConfig().name(); // For code coverage

export type NewRulesConfig = {
    the_name_you_will_use_in_your_rules_and_states: number;
};
