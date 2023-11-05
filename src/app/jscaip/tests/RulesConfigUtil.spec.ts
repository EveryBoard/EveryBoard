/* eslint-disable max-lines-per-function */
import { Localized } from 'src/app/utils/LocaleUtils';
import { NamedRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { RulesUtils } from './RulesUtils.spec';
import { MGPValidator, MGPValidators } from 'src/app/utils/MGPValidator';
import { RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';

describe('RulesConfigUtil', () => {

    describe('RulesConfigDescription', () => {

        type MyConfig = {
            helaRosee: number;
        };

        const defaultNamedRulesConfig: NamedRulesConfig<MyConfig> = {
            config: { helaRosee: 5 },
            name: () => 'default',
        };

        const translations: { [name in keyof MyConfig]: Localized } = { // This is the expected type of translations
            helaRosee: () => 'yéssoui idizwitenne!',
        };

        const validators: { [name in keyof MyConfig]: MGPValidator } = {
            helaRosee: MGPValidators.range(1, 99),
        };

        it('should have at least one default standard RulesConfig', () => {
            // Given any RulesConfigDescription
            const rulesConfigDescription: RulesConfigDescription<MyConfig> =
                new RulesConfigDescription(defaultNamedRulesConfig, translations, [], validators);

            // When getting default config
            const namedRulesConfig: NamedRulesConfig<MyConfig> = rulesConfigDescription.getDefaultConfig();

            // Then it should be the one we provided
            expect(namedRulesConfig).toEqual(defaultNamedRulesConfig);
        });

        it('should be possible to have other standard RulesConfig', () => {
            // Given any RulesConfigDescription
            const secondaryConfig: NamedRulesConfig<MyConfig> = {
                config: { helaRosee: 7 },
                name: () => 'numéro dosse',
            };
            const rulesConfigDescription: RulesConfigDescription<MyConfig> =
                new RulesConfigDescription(defaultNamedRulesConfig, translations, [secondaryConfig], validators);

            // When getting default config
            const namedRulesConfig: NamedRulesConfig<MyConfig> = rulesConfigDescription.getDefaultConfig();

            // Then it should still be first we provided
            expect(namedRulesConfig).toEqual(defaultNamedRulesConfig);
        });

        it('should throw when standard configs are of different type', () => {
            // Given any RulesConfigDescription
            interface MaConfigInterface extends RulesConfig {
                helaRosee: number;
            }
            const defaultConfig: NamedRulesConfig<MaConfigInterface> = {
                config: { helaRosee: 2012 },
                name: () => 'default',
            };
            // eslint-disable-next-line dot-notation
            defaultConfig.config['holaBanana'] = 5;
            const bananaTranslations: Record<string, Localized> = {
                helaRosee: () => 'yéssoui idizwitenne!',
                holaBanana: () => 'pepeleptipu',
            };

            const secondaryConfig: NamedRulesConfig<MaConfigInterface> = {
                config: { helaRosee: 7 },
                name: () => 'secondary',
            };

            // When trying to create the element
            // Then it should throw and log
            RulesUtils.expectToThrowAndLog(() => {
                new RulesConfigDescription(defaultConfig, bananaTranslations, [secondaryConfig], validators);
            }, 'Field missing in secondary config!');
        });

        it('should throw when a number validator is missing', () => {
            // Given any RulesConfigDescription
            const defaultConfig: NamedRulesConfig<MyConfig> = {
                config: { helaRosee: 2012 },
                name: () => 'default',
            };
            const translations: Record<string, Localized> = {
                helaRosee: () => 'yéssoui idizwitenne!',
            };

            // When trying to create the element
            // Then it should throw and log
            RulesUtils.expectToThrowAndLog(() => {
                new RulesConfigDescription(defaultConfig, translations);
            }, 'Validator missing for helaRosee!');
        });

        it('should throw if not provided with translation for one field', () => {
            // Given any RulesConfigDescription
            // When trying to create the element
            // Then it should throw and log
            const missingTranslation: { [name in keyof MyConfig]: Localized } =
                {} as { [name in keyof MyConfig]: Localized };
            // The casting allow to avoid the compilation error, but it is still broken
            RulesUtils.expectToThrowAndLog(() => {
                new RulesConfigDescription(defaultNamedRulesConfig, missingTranslation, [], validators);
            }, `Field 'helaRosee' missing in translation!`);
        });

    });

});
