import { RulesConfigDescription } from 'src/app/jscaip/RulesConfigUtil';
import { MGPValidation } from 'src/app/utils/MGPValidation';

// Note: RulesConfigDescriptions object are right now centralised in RulesConfigDescriptions
export const newRulesConfigDescription: RulesConfigDescription = {
    fields: [
        {
            // the name of the parameter that could configure your game (ex: board size)'
            name: 'the_name_you_will_use_in_your_rules_and_states',
            i18nName: () => 'some localisable string to be read by user',
            defaultValue: 9,
            isValid: (value: number | null): MGPValidation => {
                return MGPValidation.failure('Return a localizable message saying why this config choice is unacceptable');
            },
        },
    ],
};

newRulesConfigDescription.fields[0].i18nName(); // For code coverage
// eslint-disable-next-line dot-notation
newRulesConfigDescription.fields[0]['isValid'](5); // For code coverage

export type NewRulesConfig = {
    the_name_you_will_use_in_your_rules_and_states: number;
};
