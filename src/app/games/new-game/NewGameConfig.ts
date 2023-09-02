import { GameConfigDescription } from 'src/app/jscaip/ConfigUtil';

// Note: GameConfigDescriptions are right now centralised in GameConfiguration
export const NewGameConfigDescription: GameConfigDescription = {
    fields: [
        {
            // the name of the parameter that could configure your game (ex: board size)'
            name: 'the_name_you_will_use_in_your_rules_and_states', // TODO var-like-name + localisable-name
            defaultValue: 9,
            type: 'number', // help to decide what type of input to use in the game configurations screen
        },
    ],
};

export type NewGameConfig = {
    the_name_you_will_use_in_your_rules_and_states: number;
};
