/* eslint-disable max-lines-per-function */
import { DefaultConfigDescription, NamedRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { MGPValidators } from 'src/app/utils/MGPValidator';
import { ConfigLine, RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { TestUtils } from 'src/app/utils/tests/TestUtils.spec';

describe('RulesConfigUtil', () => {

    describe('RulesConfigDescription', () => {

        type MyConfig = {
            helaRosee: number;
        };

        const defaultNamedRulesConfig: DefaultConfigDescription<MyConfig> = {
            name: () => 'My Default Config',
            config: {
                helaRosee: new ConfigLine(5, () => 'coucoute', MGPValidators.range(1, 99)),
            },
        };

        it('should have at least one default standard RulesConfig', () => {
            // Given any RulesConfigDescription
            const rulesConfigDescription: RulesConfigDescription<MyConfig> =
                new RulesConfigDescription(defaultNamedRulesConfig);

            // When getting default config
            const namedRulesConfig: NamedRulesConfig<MyConfig> = rulesConfigDescription.getDefaultConfig();

            // Then it should be the one we provided
            expect(namedRulesConfig.config).toEqual({ helaRosee: 5 });
        });

        it('should be possible to have other standard RulesConfig', () => {
            // Given any RulesConfigDescription with secondary config
            const secondaryConfig: NamedRulesConfig<MyConfig> = {
                name: () => 'My Secondary Config',
                config: { helaRosee: 7 },
            };
            const rulesConfigDescription: RulesConfigDescription<MyConfig> =
                new RulesConfigDescription(defaultNamedRulesConfig, [secondaryConfig]);

            // When getting default config
            const namedRulesConfig: NamedRulesConfig<MyConfig> = rulesConfigDescription.getDefaultConfig();

            // Then it should still be first we provided
            expect(namedRulesConfig.config).toEqual({ helaRosee: 5 });
        });

        it('should throw when standard configs are of different type', () => {
            // Given any RulesConfigDescription
            interface MaConfigInterface extends RulesConfig {
                helaRosee: number;
            }
            const defaultConfig: DefaultConfigDescription<MaConfigInterface> = {
                name: () => 'My Default Config',
                config: {
                    helaRosee: new ConfigLine(2012, () => 'biilboul eh!', MGPValidators.range(1, 99)),
                },
            };
            defaultConfig.config.holaBanana = new ConfigLine(5, () => 'biilboul eh!', MGPValidators.range(1, 99));

            const secondaryConfig: NamedRulesConfig<MaConfigInterface> = {
                config: { helaRosee: 7 },
                name: () => 'My Secondary Config',
            };

            // When trying to create the element
            // Then it should throw and log
            TestUtils.expectToThrowAndLog(() => {
                new RulesConfigDescription(defaultConfig, [secondaryConfig]);
            }, 'Field missing in My Secondary Config config!');
        });

    });

});
