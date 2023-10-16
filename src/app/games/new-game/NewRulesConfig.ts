import { RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidation } from 'src/app/utils/MGPValidation';

// Note: RulesConfigDescriptions object are right now centralised in RulesConfigDescriptions
// It is FULLY mandatory, if you don't want to make your game configurable just yet, ignore this!
export const newGameRulesConfigDescription: RulesConfigDescription =
    new RulesConfigDescription({
        name: () => 'the internationalisable name of that standard config',
        config: {
            the_name_you_will_use_in_your_rules_and_states: 5,
        },
    }, {
        the_name_you_will_use_in_your_rules_and_states: () => `the translatable and writable name of this parameter`,
    }, [
        // Here, if you have other "standard" configuration, add a list
        // There are of the same type as the default one in first parameter !
    ], {
        the_name_you_will_use_in_your_rules_and_states: (value: number | null): MGPValidation => {
            if (value == null) {
                return MGPValidation.failure('Return a localizable message for the user saying why this config choice is unacceptable');
            } else {
                return MGPValidation.SUCCESS;
            }
        },
    });

newGameRulesConfigDescription.getDefaultConfig().name(); // For code coverage
newGameRulesConfigDescription.translations.the_name_you_will_use_in_your_rules_and_states(); // For coverage
if (newGameRulesConfigDescription.validator.the_name_you_will_use_in_your_rules_and_states) {
    newGameRulesConfigDescription.validator.the_name_you_will_use_in_your_rules_and_states(null); // For coverage
    newGameRulesConfigDescription.validator.the_name_you_will_use_in_your_rules_and_states(1); // For coverage
}
