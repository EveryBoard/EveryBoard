import { MGPValidator, MGPValidators } from 'src/app/utils/MGPValidator';

import { MancalaConfig } from 'src/app/games/mancala/common/MancalaConfig';
import { TaflConfig } from 'src/app/games/tafl/TaflConfig';
import { P4Config, P4Rules } from 'src/app/games/p4/P4Rules';
import { NamedRulesConfig, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPSet } from 'src/app/utils/MGPSet';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EpaminondasRules } from 'src/app/games/epaminondas/EpaminondasRules';
import { BrandhubRules } from 'src/app/games/tafl/brandhub/BrandhubRules';
import { AwaleRules } from 'src/app/games/mancala/awale/AwaleRules';
import { GoRules } from 'src/app/games/go/GoRules';
import { defaultGobanConfig } from 'src/app/jscaip/GobanConfig';
import { HnefataflRules } from 'src/app/games/tafl/hnefatafl/HnefataflRules';
import { KalahRules } from 'src/app/games/mancala/kalah/KalahRules';
import { TablutRules } from 'src/app/games/tafl/tablut/TablutRules';
import { QuixoConfig } from 'src/app/games/quixo/QuixoState';
import { transition } from '@angular/animations';
import { QuixoRules } from 'src/app/games/quixo/QuixoRules';

export class RulesConfigDescription<R extends RulesConfig = RulesConfig> {

    public static readonly DEFAULT: RulesConfigDescription = new RulesConfigDescription(
        {
            name: (): string => $localize`Default`,
            config: {},
        },
        {},
    );

    public standardConfigs: NamedRulesConfig<R>[];

    public constructor(defaultConfig: NamedRulesConfig<R>,
                       public readonly translations: Record<keyof R, Localized>,
                       otherStandardConfigs: NamedRulesConfig<R>[] = [],
                       public readonly validator: { [name in keyof R]?: MGPValidator } = {})
    {
        this.standardConfigs = [defaultConfig].concat(otherStandardConfigs);
        const defaultKeys: MGPSet<string> = new MGPSet(Object.keys(defaultConfig.config));
        const translationsKey: MGPSet<string> = new MGPSet(Object.keys(translations));
        const missingTranslation: MGPOptional<string> = translationsKey.getMissingElement(defaultKeys);
        Utils.assert(missingTranslation.isAbsent(),
                     `Field '${ missingTranslation.getOrElse('') }' missing in translation!`);
        for (const otherStandardConfig of otherStandardConfigs) {
            const key: MGPSet<string> = new MGPSet(Object.keys(otherStandardConfig.config));
            Utils.assert(key.equals(defaultKeys), `Field missing in ${ otherStandardConfig.name() } config!`);
        }
        for (const key of defaultKeys) {
            if (typeof defaultConfig.config[key] === 'number') {
                Utils.assert(key in validator, `Validator missing for ${ key }!`);
            }
        }
    }

    public getDefaultConfig(): NamedRulesConfig<R> {
        return this.standardConfigs[0];
    }

    public getNonDefaultConfigs(): NamedRulesConfig<R>[] {
        return this.standardConfigs.slice(1);
    }

    public getI18nName(field: string): string {
        return this.translations[field]();
    }

    public getConfig(configName: string): R {
        return this.standardConfigs.filter((v: NamedRulesConfig) => v.name() === configName)[0].config;
    }

    public getValidator(fieldName: string): MGPValidator {
        return this.getOptionalValidator(fieldName).get();
    }
    private getOptionalValidator(fieldName: string): MGPOptional<MGPValidator> {
        if (fieldName in this.validator) {
            return MGPOptional.of(this.validator[fieldName] as MGPValidator);
        } else {
            return MGPOptional.empty();
        }
    }

}

export class RulesConfigDescriptions {

    public static readonly AWALE: RulesConfigDescription<MancalaConfig> = new RulesConfigDescription({
        name: (): string => $localize`Awalé`,
        config: AwaleRules.DEFAULT_CONFIG,
    }, {
        width: (): string => $localize`Width`,
        seedsByHouse: (): string => $localize`Seed by house`,
        feedOriginalHouse: (): string => $localize`Feed original house`,
        mustFeed: (): string => $localize`Must feed`,
        passByPlayerStore: (): string => $localize`Pass by player store`,
    }, [
    ], {
        width: MGPValidators.range(1, 99),
        seedsByHouse: MGPValidators.range(1, 99),
    });

    public static readonly BRANDHUB: RulesConfigDescription<TaflConfig> = new RulesConfigDescription({
        name: (): string => $localize`Brandhub`,
        config: BrandhubRules.DEFAULT_CONFIG,
    }, {
        castleIsLeftForGood: (): string => $localize`Central throne is left for good`,
        borderCanSurroundKing: (): string => $localize`Edge can surround king`,
        centralThroneCanSurroundKing: (): string => $localize`Central throne can surround king`,
        kingFarFromHomeCanBeSandwiched: (): string => $localize`King far from home can be sandwiched`,
        invaderStarts: (): string => $localize`Invader Starts`,
    });

    public static readonly EPAMINONDAS: RulesConfigDescription = new RulesConfigDescription({
        name: (): string => $localize`Epaminondas`,
        config: EpaminondasRules.DEFAULT_CONFIG,
    }, {
        width: (): string => $localize`Width`,
        emptyHeight: (): string => $localize`Number of empty rows`,
        rowOfSoldier: (): string => $localize`Number of soldier rows`,
    }, [
    ], {
        width: MGPValidators.range(1, 99),
        emptyHeight: MGPValidators.range(1, 99),
        rowOfSoldier: MGPValidators.range(1, 99),
    });

    public static readonly GO: RulesConfigDescription = new RulesConfigDescription({
        name: (): string => $localize`19 x 19`,
        config: GoRules.DEFAULT_CONFIG,
    }, {
        width: (): string => $localize`Width`,
        height: (): string => $localize`Height`,
        handicap: (): string => $localize`Handicap`,
    }, [{
        name: (): string => $localize`13 x 13`,
        config: {
            width: 13,
            height: 13,
            handicap: 0,
        },
    }, {
        name: (): string => $localize`9 x 9`,
        config: {
            width: 9,
            height: 9,
            handicap: 0,
        },
    }], {
        width: MGPValidators.range(1, 99),
        height: MGPValidators.range(1, 99),
        handicap: MGPValidators.range(0, 9),
    });

    public static readonly GOBAN: RulesConfigDescription = new RulesConfigDescription({
        name: (): string => $localize`Default`,
        config: defaultGobanConfig,
    }, {
        width: (): string => $localize`Width`,
        height: (): string => $localize`Height`,
    }, [
    ], {
        width: MGPValidators.range(1, 99),
        height: MGPValidators.range(1, 99),
    });

    public static readonly HNEFATAFL: RulesConfigDescription<TaflConfig> = new RulesConfigDescription({
        name: (): string => $localize`Brandhub`,
        config: HnefataflRules.DEFAULT_CONFIG,
    }, {
        castleIsLeftForGood: (): string => $localize`Central throne is left for good`,
        borderCanSurroundKing: (): string => $localize`Edge can surround king`,
        centralThroneCanSurroundKing: (): string => $localize`Central throne can surround king`,
        kingFarFromHomeCanBeSandwiched: (): string => $localize`King far from home can be sandwiched`,
        invaderStarts: (): string => $localize`Invader Starts`,
    });

    public static readonly KALAH: RulesConfigDescription<MancalaConfig> = new RulesConfigDescription({
        name: (): string => $localize`Kalah`,
        config: KalahRules.DEFAULT_CONFIG,
    }, {
        width: (): string => $localize`Width`,
        seedsByHouse: (): string => $localize`Seed by house`,
        feedOriginalHouse: (): string => $localize`Feed original house`,
        mustFeed: (): string => $localize`Must feed`,
        passByPlayerStore: (): string => $localize`Pass by player store`,
    }, [
    ], {
        width: MGPValidators.range(1, 99),
        seedsByHouse: MGPValidators.range(1, 99),
    });

    public static readonly P4: RulesConfigDescription<P4Config> = new RulesConfigDescription({
        name: (): string => $localize`Default`,
        config: P4Rules.DEFAULT_CONFIG,
    }, {
        width: (): string => $localize`Width`,
        height: (): string => $localize`Height`,
    }, [
    ], {
        width: MGPValidators.range(1, 99),
        height: MGPValidators.range(1, 99),
    });

    public static readonly QUIXO: RulesConfigDescription<QuixoConfig> = new RulesConfigDescription({
        name: (): string => $localize`Quixo`,
        config: QuixoRules.DEFAULT_CONFIG,
    }, {
        width: (): string => $localize`Width`, // TODO: put width and height in common everyEffingWhere
        height: (): string => $localize`Height`,
    }, [
    ], {
        width: MGPValidators.range(1, 99),
        height: MGPValidators.range(1, 99),
    });

    public static readonly TABLUT: RulesConfigDescription<TaflConfig> = new RulesConfigDescription({
        name: (): string => $localize`Brandhub`,
        config: TablutRules.DEFAULT_CONFIG,
    }, {
        castleIsLeftForGood: (): string => $localize`Central throne is left for good`,
        borderCanSurroundKing: (): string => $localize`Edge can surround king`,
        centralThroneCanSurroundKing: (): string => $localize`Central throne can surround king`,
        kingFarFromHomeCanBeSandwiched: (): string => $localize`King far from home can be sandwiched`,
        invaderStarts: (): string => $localize`Invader Starts`,
    });

    public static readonly ALL: RulesConfigDescription[] = [
        RulesConfigDescriptions.AWALE,
        RulesConfigDescriptions.BRANDHUB,
        RulesConfigDescriptions.EPAMINONDAS,
        RulesConfigDescriptions.GO,
        RulesConfigDescriptions.GOBAN,
        RulesConfigDescriptions.HNEFATAFL,
        RulesConfigDescriptions.KALAH,
        RulesConfigDescriptions.P4,
        RulesConfigDescriptions.QUIXO,
        RulesConfigDescriptions.TABLUT,
    ];
}
