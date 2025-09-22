import { JSONPrimitive, MGPValidation, Set, Utils } from '@everyboard/lib';

import { MGPValidator, MGPValidators } from 'src/app/utils/MGPValidator';
import { ConfigDescriptionType, DefaultConfigDescription, EmptyRulesConfig, NamedRulesConfig, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { Localized } from 'src/app/utils/LocaleUtils';

export class RulesConfigDescriptionLocalizable {

    public static readonly CUSTOM: () => string = (): string => $localize`Custom`;

    public static readonly WIDTH: () => string = (): string => $localize`Width`;

    public static readonly HEIGHT: () => string = (): string => $localize`Height`;

    public static readonly SIZE: () => string = (): string => $localize`Size`;

    public static readonly ALIGNMENT_SIZE: () => string = () => $localize`Number of aligned pieces needed to win`;

    public static readonly NUMBER_OF_DROPS: () => string = () => $localize`Number of pieces dropped per turn`;

    public static readonly NUMBER_OF_EMPTY_ROWS: () => string = () => $localize`Number of empty rows`;

    public static readonly NUMBER_OF_PIECES_ROWS: () => string = () => $localize`Number of pieces rows`;

}

export abstract class ConfigLine<R extends RulesConfig = EmptyRulesConfig> {

    protected constructor(public readonly defaultValue: ConfigDescriptionType, // Previously value: TODO REMOVE COMMENT
                          public readonly title: Localized)
    {
    }

    // Should check if the value is valid
    public abstract checkValidity(value: JSONPrimitive, config: R): MGPValidation;

}

export class NumberConfig<R extends RulesConfig = EmptyRulesConfig> extends ConfigLine<R> {

    public constructor(defaultValue: number,
                       title: Localized,
                       public readonly validator: MGPValidator<R>)
    {
        super(defaultValue, title);
    }

    public checkValidity(value: JSONPrimitive, config: R): MGPValidation {
        if (typeof(value) === 'number') {
            return this.validator(value, config);
        } else {
            return MGPValidation.failure('NumberConfig expects a number value');
        }
    }

}

export class EnumConfig<R extends RulesConfig = EmptyRulesConfig> extends ConfigLine<R> {

    public constructor(value: string,
                       title: Localized,
                       public readonly possibleValues: { [key: string]: Localized },
                       public readonly validator: MGPValidator<R> = () => MGPValidation.SUCCESS)
    {
        super(value, title);
    }

    public override checkValidity(fieldValue: JSONPrimitive, config: R): MGPValidation {
        return this.validator(fieldValue as number, config);
    }
}

export class BooleanConfig<R extends RulesConfig = EmptyRulesConfig> extends ConfigLine<R> {

    public constructor(defaultValue: boolean, title: Localized)
    {
        super(defaultValue, title);
    }

    public checkValidity(value: JSONPrimitive, config: R): MGPValidation {
        if (typeof(value) === 'boolean') {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('BooleanConfig expects a boolean value');
        }
    }

}


export class RulesConfigDescription<R extends RulesConfig = EmptyRulesConfig> {

    private readonly defaultConfig: NamedRulesConfig<R>;

    public constructor(public readonly defaultConfigDescription: DefaultConfigDescription<R>,
                       public readonly nonDefaultStandardConfigs: NamedRulesConfig<R>[] = [])
    {
        const config: R = {} as R;
        for (const field of this.getFields()) {
            config[field as keyof R] = defaultConfigDescription.config[field].defaultValue as R[keyof R];
        }
        this.defaultConfig = {
            name: defaultConfigDescription.name,
            config,
        };
        const defaultKeys: Set<string> = new Set(Object.keys(defaultConfigDescription.config));
        for (const otherStandardConfig of nonDefaultStandardConfigs) {
            const key: Set<string> = new Set(Object.keys(otherStandardConfig.config));
            Utils.assert(key.equals(defaultKeys), `Field missing in ${ otherStandardConfig.name() } config!`);
        }
    }

    public getStandardConfigs(): NamedRulesConfig<R>[] {
        return [this.defaultConfig].concat(this.nonDefaultStandardConfigs);
    }

    public getDefaultConfig(): NamedRulesConfig<R> {
        return this.defaultConfig;
    }

    public getNonDefaultStandardConfigs(): NamedRulesConfig<R>[] {
        return this.nonDefaultStandardConfigs;
    }

    public getConfig(configName: string): R {
        const rulesConfig: NamedRulesConfig<R> = this.getStandardConfigs()
            .filter((v: NamedRulesConfig<R>) => v.name() === configName)[0];
        return rulesConfig.config;
    }

    public getFields(): string[] {
        return Object.keys(this.defaultConfigDescription.config);
    }

    public getFieldLocalizedName(field: string): string {
        return this.defaultConfigDescription.config[field].title();
    }

    private getFieldValidity(field: string, value: JSONPrimitive): MGPValidation {
        if (value == null) {
            // no value was provided, it is invalid
            return MGPValidation.failure($localize`This value is mandatory`);
        }
        const configLine: ConfigLine<R> | null = this.defaultConfigDescription.config[field];
        if (configLine == null) {
            // this does not match an element from the config, it is invalid
            return MGPValidation.failure($localize`There is no such configuration element`);
        }
        const config: R = this.getDefaultConfig().config;
        return configLine.checkValidity(value, config);
    }

    public isValid(field: string, value: JSONPrimitive): boolean {
        return this.getFieldValidity(field, value).isSuccess();
    }

    public getValidityError(field: string, value: JSONPrimitive): string {
        return this.getFieldValidity(field, value).getReason();
    }

}

export class RulesConfigDescriptions {

    public static readonly GOBAN: RulesConfigDescription<GobanConfig> = new RulesConfigDescription<GobanConfig>({
        name: (): string => $localize`Default`,
        config: {
            width: new NumberConfig(19, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
            height: new NumberConfig(19, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(1, 99)),
        },
    });

}
