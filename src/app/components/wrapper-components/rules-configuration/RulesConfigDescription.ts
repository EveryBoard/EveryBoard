import { MGPValidator, MGPValidators } from 'src/app/utils/MGPValidator';

import { EmptyRulesConfig, NamedRulesConfig, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPSet } from 'src/app/utils/MGPSet';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GobanConfig, defaultGobanConfig } from 'src/app/jscaip/GobanConfig';

export class RulesConfigDescriptionLocalizable {

    public static readonly WIDTH: () => string = (): string => $localize`Width`;

    public static readonly HEIGHT: () => string = (): string => $localize`Height`;

}

export class RulesConfigDescription<R extends RulesConfig = EmptyRulesConfig> {
    // TODO FOR REVIEW: pour les config non type, si j'enlève le "= RulesConfig" ça devient obligé de mettre ça a plein d'endroit, moyen ?

    public static readonly DEFAULT: RulesConfigDescription = new RulesConfigDescription(
        {
            name: (): string => $localize`Default`,
            config: {},
        },
        {},
    );

    public constructor(public readonly defaultConfig: NamedRulesConfig<R>,
                       public readonly translations: Record<keyof R, Localized>,
                       public readonly nonDefaultStandardConfigs: NamedRulesConfig<R>[] = [],
                       public readonly validator: { [name in keyof R]?: MGPValidator } = {})
    {
        const defaultKeys: MGPSet<string> = new MGPSet(Object.keys(defaultConfig.config));
        const translationsKey: MGPSet<string> = new MGPSet(Object.keys(translations));
        const missingTranslation: MGPOptional<string> = translationsKey.getMissingElementFrom(defaultKeys);
        const translationMissingError: string = `Field '${ missingTranslation.getOrElse('') }' missing in translation!`;
        Utils.assert(missingTranslation.isAbsent(), translationMissingError);
        for (const otherStandardConfig of nonDefaultStandardConfigs) {
            const key: MGPSet<string> = new MGPSet(Object.keys(otherStandardConfig.config));
            Utils.assert(key.equals(defaultKeys), `Field missing in ${ otherStandardConfig.name() } config!`);
        }
        for (const key of defaultKeys) {
            if (typeof defaultConfig.config[key] === 'number') {
                Utils.assert(key in validator, `Validator missing for ${ key }!`);
            }
        }
    }

    public getStandardConfigs(): NamedRulesConfig<R>[] {
        return [this.defaultConfig].concat(this.nonDefaultStandardConfigs);
    }

    public getDefaultConfig(): NamedRulesConfig<R> {
        return this.defaultConfig;
    }

    public getFields(): string[] {
        const config: RulesConfig = this.getDefaultConfig().config;
        return Object.keys(config);
    }

    public getNonDefaultStandardConfigs(): NamedRulesConfig<R>[] {
        return this.nonDefaultStandardConfigs;
    }

    public getI18nName(field: string): string {
        return this.translations[field]();
    }

    public getConfig(configName: string): R {
        return this.getStandardConfigs().filter((v: NamedRulesConfig) => v.name() === configName)[0].config;
    }

    public getValidator(fieldName: string): MGPValidator {
        Utils.assert(fieldName in this.validator, fieldName + ' is not a validator!');
        return this.validator[fieldName] as MGPValidator;
    }

}

export class RulesConfigDescriptions {

    public static readonly GOBAN: RulesConfigDescription<GobanConfig> = new RulesConfigDescription({
        name: (): string => $localize`Default`,
        config: defaultGobanConfig,
    }, {
        width: RulesConfigDescriptionLocalizable.WIDTH,
        height: RulesConfigDescriptionLocalizable.HEIGHT,
    }, [
    ], {
        width: MGPValidators.range(1, 99),
        height: MGPValidators.range(1, 99),
    });
}
