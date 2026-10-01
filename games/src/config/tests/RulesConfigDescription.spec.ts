/* eslint-disable no-multi-spaces */
/* eslint-disable max-lines-per-function */
import { MGPMap } from '@everyboard/lib';

import { AbaloneRules } from '../../games/abalone/AbaloneRules';
import { ApagosRules } from '../../games/apagos/ApagosRules';
import { BashniRules } from '../../games/checkers/bashni/BashniRules';
import { InternationalCheckersRules } from '../../games/checkers/international-checkers/InternationalCheckersRules';
import { LascaRules } from '../../games/checkers/lasca/LascaRules';
import { CoerceoRules } from '../../games/coerceo/CoerceoRules';
import { ConnectSixRules } from '../../games/connect-six/ConnectSixRules';
import { ConspirateursRules } from '../../games/conspirateurs/ConspirateursRules';
import { DiaballikRules } from '../../games/diaballik/DiaballikRules';
import { DiamRules } from '../../games/diam/DiamRules';
import { DvonnRules } from '../../games/dvonn/DvonnRules';
import { EncapsuleRules } from '../../games/encapsule/EncapsuleRules';
import { EpaminondasRules } from '../../games/epaminondas/EpaminondasRules';
import { GipfRules } from '../../games/gipf/GipfRules';
import { GoRules } from '../../games/gos/go/GoRules';
import { HexagonalGoRules } from '../../games/gos/hexagonal-go/HexagonalGoRules';
import { TriangularGoRules } from '../../games/gos/triangular-go/TriangularGoRules';
import { ZoomedGoRules } from '../../games/gos/zoomed-go/ZoomedGoRules';
import { HexodiaRules } from '../../games/hexodia/HexodiaRules';
import { HiveRules } from '../../games/hive/HiveRules';
import { KamisadoRules } from '../../games/kamisado/KamisadoRules';
import { LinesOfActionRules } from '../../games/lines-of-action/LinesOfActionRules';
import { LodestoneRules } from '../../games/lodestone/LodestoneRules';
import { AwaleRules } from '../../games/mancala/awale/AwaleRules';
import { BaAwaRules } from '../../games/mancala/ba-awa/BaAwaRules';
import { KalahRules } from '../../games/mancala/kalah/KalahRules';
import { MartianChessRules } from '../../games/martian-chess/MartianChessRules';
import { P4Rules } from '../../games/p4/P4Rules';
import { PentagoRules } from '../../games/pentago/PentagoRules';
import { PenteRules } from '../../games/pente/PenteRules';
import { PylosRules } from '../../games/pylos/PylosRules';
import { QuartoRules } from '../../games/quarto/QuartoRules';
import { QuebecCastlesRules } from '../../games/quebec-castles/QuebecCastlesRules';
import { QuixoRules } from '../../games/quixo/QuixoRules';
import { ReversiRules } from '../../games/reversis/reversi/ReversiRules';
import { ToricReversiRules } from '../../games/reversis/toric-reversi/ToricReversiRules';
import { SaharaRules } from '../../games/sahara/SaharaRules';
import { SiamRules } from '../../games/siam/SiamRules';
import { SixRules } from '../../games/six/SixRules';
import { SquarzRules } from '../../games/squarz/SquarzRules';
import { BrandhubRules } from '../../games/tafl/brandhub/BrandhubRules';
import { HnefataflRules } from '../../games/tafl/hnefatafl/HnefataflRules';
import { TablutRules } from '../../games/tafl/tablut/TablutRules';
import { TeekoRules } from '../../games/teeko/TeekoRules';
import { TrexoRules } from '../../games/trexo/TrexoRules';
import { YinshRules } from '../../games/yinsh/YinshRules';
import { AbstractRules } from '../../jscaip/Rules';
import { MGPValidators } from '../../utils/MGPValidator';
import { NumberConfig } from '../NumberConfig';
import { DefaultConfigDescription, NamedRulesConfig, RulesConfig } from '../RulesConfig';
import { RulesConfigDescription } from '../RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../RulesConfigDescriptionLocalizable';

const gameRulesByURL: MGPMap<string, AbstractRules> = new MGPMap<string, AbstractRules>([
    { key: 'P4',                    value: P4Rules.get()                    },
    { key: 'Awale',                 value: AwaleRules.get()                 },
    { key: 'Quarto',                value: QuartoRules.get()                },
    { key: 'Tablut',                value: TablutRules.get()                },
    { key: 'Reversi',               value: ReversiRules.get()               },
    { key: 'Go',                    value: GoRules.get()                    },
    { key: 'Encapsule',             value: EncapsuleRules.get()             },
    { key: 'Siam',                  value: SiamRules.get()                  },
    { key: 'Sahara',                value: SaharaRules.get()                },
    { key: 'Pylos',                 value: PylosRules.get()                 },
    { key: 'Kamisado',              value: KamisadoRules.get()              },
    { key: 'Quixo',                 value: QuixoRules.get()                 },
    { key: 'Dvonn',                 value: DvonnRules.get()                 },
    { key: 'Epaminondas',           value: EpaminondasRules.get()           },
    { key: 'Gipf',                  value: GipfRules.get()                  },
    { key: 'Coerceo',               value: CoerceoRules.get()               },
    { key: 'Six',                   value: SixRules.get()                   },
    { key: 'LinesOfAction',         value: LinesOfActionRules.get()         },
    { key: 'Pentago',               value: PentagoRules.get()               },
    { key: 'Abalone',               value: AbaloneRules.get()               },
    { key: 'Yinsh',                 value: YinshRules.get()                 },
    { key: 'Apagos',                value: ApagosRules.get()                },
    { key: 'Diam',                  value: DiamRules.get()                  },
    { key: 'Brandhub',              value: BrandhubRules.get()              },
    { key: 'Conspirateurs',         value: ConspirateursRules.get()         },
    { key: 'Lodestone',             value: LodestoneRules.get()             },
    { key: 'MartianChess',          value: MartianChessRules.get()          },
    { key: 'Hnefatafl',             value: HnefataflRules.get()             },
    { key: 'Hive',                  value: HiveRules.get()                  },
    { key: 'Trexo',                 value: TrexoRules.get()                 },
    { key: 'Lasca',                 value: LascaRules.get()                 },
    { key: 'ConnectSix',            value: ConnectSixRules.get()            },
    { key: 'Pente',                 value: PenteRules.get()                 },
    { key: 'Teeko',                 value: TeekoRules.get()                 },
    { key: 'Kalah',                 value: KalahRules.get()                 },
    { key: 'Diaballik',             value: DiaballikRules.get()             },
    { key: 'BaAwa',                 value: BaAwaRules.get()                 },
    { key: 'Squarz',                value: SquarzRules.get()                },
    { key: 'Hexodia',               value: HexodiaRules.get()               },
    { key: 'TriangularGo',          value: TriangularGoRules.get()          },
    { key: 'InternationalCheckers', value: InternationalCheckersRules.get() },
    { key: 'QuebecCastles',         value: QuebecCastlesRules.get()         },
    { key: 'HexagonalGo',           value: HexagonalGoRules.get()           },
    { key: 'ToricReversi',          value: ToricReversiRules.get()          },
    { key: 'Bashni',                value: BashniRules.get()                },
    { key: 'ZoomedGo',              value: ZoomedGoRules.get()              },
]);

describe(`RulesConfigDescriptions`, () => {

    for (const urlName of gameRulesByURL.getKeyList()) {

        const rulesConfigDescription: RulesConfigDescription<RulesConfig> =
            gameRulesByURL.get(urlName).get().getRulesConfigDescription();

        if (rulesConfigDescription.getFields().length > 0) {
            it(`should have internationalized fields of ${ urlName }`, () => {
                for (const field of rulesConfigDescription.getFields()) {
                    const defaultConfigDescription: DefaultConfigDescription =
                        rulesConfigDescription.defaultConfigDescription;
                    expect(defaultConfigDescription.config[field].title().length).toBeGreaterThan(0);
                }
            });
        }

        it(`should have an internationalized name for each standard config of ${ urlName }`, () => {
            for (const standardConfig of rulesConfigDescription.getStandardConfigs()) {
                expect(standardConfig.name().length).toBeGreaterThan(0);
            }
        });

    }

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
