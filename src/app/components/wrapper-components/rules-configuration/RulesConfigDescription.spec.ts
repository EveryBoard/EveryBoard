import { RulesConfigDescription } from './RulesConfigDescription';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe(`RulesConfigDescriptions`, () => {

    for (const gameInfo of GameInfo.ALL_GAMES()) {

        const rulesConfigDescription: MGPOptional<RulesConfigDescription> = gameInfo.rules.getRulesConfigDescription();

        if (rulesConfigDescription.isPresent()) {

            it(`should have internationalized fields of ${ gameInfo.urlName }`, () => {
                for (const field of rulesConfigDescription.get().getFields()) {
                    expect(rulesConfigDescription.get().translations[field]().length).toBeGreaterThan(0);
                }
            });

            it(`should have a internationalized name for each standard config of ${ gameInfo.urlName }`, () => {
                for (const standardConfig of rulesConfigDescription.get().getStandardConfigs()) {
                    expect(standardConfig.name().length).toBeGreaterThan(0);
                }
            });

        }

    }

});
