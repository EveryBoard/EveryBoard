import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { RulesConfigDescription } from './RulesConfigDescription';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';

for (const gameInfo of GameInfo.ALL_GAMES()) {

    describe(`RulesConfigDescriptions of ${ gameInfo.urlName }`, () => {

        const rulesConfigDescription: RulesConfigDescription = gameInfo.rules.getRulesConfigDescription();

        it(`should have internationalised fields`, () => {
            const fields: RulesConfig = rulesConfigDescription.getDefaultConfig().config;
            for (const field of Object.keys(fields)) {
                expect(rulesConfigDescription.translations[field]().length).toBeGreaterThan(0);
            }
        });

        it(`should have a internationalised name for each standard config`, () => {
            for (const standardConfig of rulesConfigDescription.getStandardConfigs()) {
                expect(standardConfig.name().length).toBeGreaterThan(0);
            }
        });

    });

}
