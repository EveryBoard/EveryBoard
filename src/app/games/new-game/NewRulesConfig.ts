import { RulesConfigDescription } from 'src/app/jscaip/RulesConfigUtil';

// Note: RulesConfigDescriptions object are right now centralised in RulesConfigDescriptions
export const NewRulesConfigDescription: RulesConfigDescription = {
    fields: [
        {
            // the name of the parameter that could configure your game (ex: board size)'
            name: 'the_name_you_will_use_in_your_rules_and_states',
            i18nName: () => 'some localisable string to be read by user',
            defaultValue: 9,
        },
    ],
};

export type NewRulesConfig = {
    the_name_you_will_use_in_your_rules_and_states: number;
};
