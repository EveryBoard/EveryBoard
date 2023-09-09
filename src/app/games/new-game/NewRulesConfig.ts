import { RulesConfigDescription } from 'src/app/jscaip/ConfigUtil';

// Note: RulesConfigDescriptions object are right now centralised in RulesConfigDescriptions
export const NewRulesConfigDescription: RulesConfigDescription = {
    fields: [
        {
            // the name of the parameter that could configure your game (ex: board size)'
            name: 'the_name_you_will_use_in_your_rules_and_states', // TODO var-like-name + localisable-name
            defaultValue: 9,
        },
    ],
};

export type NewRulesConfig = {
    the_name_you_will_use_in_your_rules_and_states: number;
};
