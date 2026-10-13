import { JSONPrimitive, MGPValidation, Set, Utils } from '@everyboard/lib';

import { ConfigLine } from './ConfigLine';
import { DefaultConfigDescription, EmptyRulesConfig, NamedRulesConfig, RulesConfig } from './RulesConfig';

export class RulesConfigDescription<R extends RulesConfig = EmptyRulesConfig> {

    public static EMPTY: RulesConfigDescription = new RulesConfigDescription({
        name: () => $localize`Default`,
        config: {},
    });

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

    public isCustomizable(): boolean {
        return this.getFields().length > 0;
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
        const configLine: ConfigLine | null = this.defaultConfigDescription.config[field];
        if (configLine == null) {
            // this does not match an element from the config, it is invalid
            return MGPValidation.failure($localize`There is no such configuration element`);
        } else {
            return configLine.checkValidity(value);
        }
    }

    public isValid(field: string, value: JSONPrimitive): boolean {
        return this.getFieldValidity(field, value).isSuccess();
    }

    public getValidityError(field: string, value: JSONPrimitive): string {
        return this.getFieldValidity(field, value).getReason();
    }

}
