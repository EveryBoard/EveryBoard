import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { RulesConfigDescription, RulesConfigDescriptions } from './RulesConfigDescription';

describe('RulesConfigDescriptions', () => {

    it('should have a i18nName for each description', () => {
        for (const description of RulesConfigDescriptions.ALL) {
            const fields: RulesConfig = description.getDefaultConfig().config;
            for (const field of Object.keys(fields)) {
                expect(description.translations[field]().length).toBeGreaterThan(0);
            }
        }
    });

    it('should have a internationalised name for each standard config', () => {
        for (const description of RulesConfigDescriptions.ALL.concat(RulesConfigDescription.DEFAULT)) {
            for (const standardConfig of description.standardConfigs) {
                expect(standardConfig.name().length).toBeGreaterThan(0);
            }
        }
    });

});
