/* eslint-disable max-lines-per-function */
import { JSONValue, MGPOptional, MGPValidation } from '@everyboard/lib';

import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from './RulesConfigDescription';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { DefaultConfigDescription, NamedRulesConfig, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { MGPValidators } from 'src/app/utils/MGPValidator';

describe(`RulesConfigDescriptions`, () => {

    for (const gameInfo of GameInfo.getAllGames()) {

        const rulesConfigDescription: MGPOptional<RulesConfigDescription<RulesConfig>> =
            gameInfo.rules.getRulesConfigDescription();

        if (rulesConfigDescription.isPresent()) {

            it(`should have internationalized fields of ${ gameInfo.urlName }`, () => {
                for (const field of rulesConfigDescription.get().getFields()) {
                    const defaultConfigDescription: DefaultConfigDescription =
                        rulesConfigDescription.get().defaultConfigDescription;
                    expect(defaultConfigDescription.config[field].title().length).toBeGreaterThan(0);
                }
            });

            it(`should have an internationalized name for each standard config of ${ gameInfo.urlName }`, () => {
                for (const standardConfig of rulesConfigDescription.get().getStandardConfigs()) {
                    expect(standardConfig.name().length).toBeGreaterThan(0);
                }
            });

        }

    }

});

describe('ConfigLine', () => {

    describe('NumberConfig', () => {

        it('should accept numbers', () => {
            // Given a NumberConfig and a corresponding value
            const configLine: NumberConfig = new NumberConfig(42, () => 'some number', MGPValidators.range(0, 100));
            const value: JSONValue = 10;
            // When checking its validity
            const validity: MGPValidation = configLine.checkValidity(value, {});
            // Then it should succeed
            expect(validity.isSuccess()).toBeTrue();
        });

        it('should reject anything else', () => {
            // Given a NumberConfig and a corresponding value
            const configLine: NumberConfig = new NumberConfig(42, () => 'some number', MGPValidators.range(0, 100));
            const value: JSONValue = 'hello';
            // When checking its validity
            const validity: MGPValidation = configLine.checkValidity(value, {});
            // Then it should fail
            expect(validity.isSuccess()).toBeFalse();
            expect(validity.getReason()).toEqual('NumberConfig expects a number value');
        });
    });

    describe('BooleanConfig', () => {

        it('should accept booleans', () => {
            // Given a BooleanConfig and a corresponding value
            const configLine: BooleanConfig = new BooleanConfig(true, () => 'some boolean');
            const value: JSONValue = true;
            // When checking its validity
            const validity: MGPValidation = configLine.checkValidity(value, {});
            // Then it should succeed
            expect(validity.isSuccess()).toBeTrue();
        });

        it('should reject anything else', () => {
            // Given a BooleanConfig and a corresponding value
            const configLine: BooleanConfig = new BooleanConfig(true, () => 'some boolean');
            const value: JSONValue = 42;
            // When checking its validity
            const validity: MGPValidation = configLine.checkValidity(value, {});
            // Then it should fail
            expect(validity.isSuccess()).toBeFalse();
            expect(validity.getReason()).toEqual('BooleanConfig expects a boolean value');
        });
    });
});

export type ConfigMock = {
    width: number;
}

describe('RulesConfigDescription', () => {

    const rulesConfigDescription: RulesConfigDescription<ConfigMock> =
        new RulesConfigDescription<ConfigMock>({
            name: (): string => 'Simple game',
            config: {
                width: new NumberConfig(7, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
            },
        }, [{
            name: (): string => 'Smaller game',
            config: {
                width: 5,
            },
        }]);

    it('should know standard configs', () => {
        // Given a rules config description
        // When getting all standard configs
        const configs: NamedRulesConfig<ConfigMock>[] = rulesConfigDescription.getStandardConfigs();
        // Then there should be the default + all named configs
        expect(configs.length).toEqual(2);
    });

    it('should be able to retrieve the default config', () => {
        // Given a rules config description
        // When retrieving the default config
        const defaultConfig: NamedRulesConfig<ConfigMock> = rulesConfigDescription.getDefaultConfig();
        // Then it should get the right one
        expect(defaultConfig.name()).toEqual('Simple game');
        expect(defaultConfig.config.width).toEqual(7);
    });

    it('should be able to retrieve the custom configs', () => {
        // Given a rules config description
        // When retrieving the default config
        const otherConfigs: NamedRulesConfig<ConfigMock>[] = rulesConfigDescription.getNonDefaultStandardConfigs();
        // Then it should get the right one
        expect(otherConfigs.length).toEqual(1);
        expect(otherConfigs[0].name()).toEqual('Smaller game');
        expect(otherConfigs[0].config.width).toEqual(5);
    });

    it('should be able to retrieve fields', () => {
        // Given a rules config description
        // When retrieving its fields
        const fields: string[] = rulesConfigDescription.getFields();
        // Then it should get all fields
        expect(fields).toEqual(['width']);
    });

    it('should be able to retrieve a config by name', () => {
        // Given a rules config description
        // When retrieving a config by name
        const config: ConfigMock = rulesConfigDescription.getConfig('Smaller game');
        // Then it should get the right config
        expect(config.width).toEqual(5);
    });

    it('should be able to retrieve a field name', () => {
        // Given a rules config description
        // When retrieving its fields
        const fieldName: string = rulesConfigDescription.getFieldLocalizedName('width');
        // Then it should get all fields
        expect(fieldName).toEqual(RulesConfigDescriptionLocalizable.WIDTH());
    });

    it('should detect the validity of a valid config field', () => {
        // Given a rules config description
        // When checking the validity of a valid field
        // Then it should be valid
        expect(rulesConfigDescription.isValid('width', 42)).toBeTrue();
    });

    it('should detect the invalidity of an empty config field', () => {
        // Given a rules config description
        // When checking the validity of an empty field
        // Then it should be invalid
        expect(rulesConfigDescription.isValid('width', null)).toBeFalse();
        expect(rulesConfigDescription.getValidityError('width', null)).toEqual('This value is mandatory');
    });

    it('should detect the invalidity of an unknown config field', () => {
        // Given a rules config description
        // When checking the validity of an unknown field
        // Then it should be invalid
        expect(rulesConfigDescription.isValid('bli', 42)).toBeFalse();
        expect(rulesConfigDescription.getValidityError('bli', 42)).toEqual('There is no such configuration element');
    });

    it('should detect the invalidity of an illegal config field', () => {
        // Given a rules config description
        // When checking the validity of an illegal field
        // Then it should be valid
        expect(rulesConfigDescription.isValid('width', 200)).toBeFalse();
        expect(rulesConfigDescription.getValidityError('width', 200)).toEqual('200 is too big, the maximum is 99');
    });

    it('should detect the invalidity of an ill-typed config field', () => {
        // Given a rules config description
        // When checking the validity of an ill-typed field
        // Then it should be valid
        expect(rulesConfigDescription.isValid('width', 'hello')).toBeFalse();
        expect(rulesConfigDescription.getValidityError('width', 'hello')).toEqual('NumberConfig expects a number value');
    });
});
