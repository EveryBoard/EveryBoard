/* eslint-disable no-multi-spaces */
/* eslint-disable max-lines-per-function */
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
import { RulesConfigDescription } from '../RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../RulesConfigDescriptionLocalizable';
import { DefaultConfigDescription, NamedRulesConfig, RulesConfig } from '../RulesConfigUtil';

const partialGameInfo: { urlName: string; rules: AbstractRules }[] = [
    { urlName: 'P4',                    rules: P4Rules.get()                    },
    { urlName: 'Awale',                 rules: AwaleRules.get()                 },
    { urlName: 'Quarto',                rules: QuartoRules.get()                },
    { urlName: 'Tablut',                rules: TablutRules.get()                },
    { urlName: 'Reversi',               rules: ReversiRules.get()               },
    { urlName: 'Go',                    rules: GoRules.get()                    },
    { urlName: 'Encapsule',             rules: EncapsuleRules.get()             },
    { urlName: 'Siam',                  rules: SiamRules.get()                  },
    { urlName: 'Sahara',                rules: SaharaRules.get()                },
    { urlName: 'Pylos',                 rules: PylosRules.get()                 },
    { urlName: 'Kamisado',              rules: KamisadoRules.get()              },
    { urlName: 'Quixo',                 rules: QuixoRules.get()                 },
    { urlName: 'Dvonn',                 rules: DvonnRules.get()                 },
    { urlName: 'Epaminondas',           rules: EpaminondasRules.get()           },
    { urlName: 'Gipf',                  rules: GipfRules.get()                  },
    { urlName: 'Coerceo',               rules: CoerceoRules.get()               },
    { urlName: 'Six',                   rules: SixRules.get()                   },
    { urlName: 'LinesOfAction',         rules: LinesOfActionRules.get()         },
    { urlName: 'Pentago',               rules: PentagoRules.get()               },
    { urlName: 'Abalone',               rules: AbaloneRules.get()               },
    { urlName: 'Yinsh',                 rules: YinshRules.get()                 },
    { urlName: 'Apagos',                rules: ApagosRules.get()                },
    { urlName: 'Diam',                  rules: DiamRules.get()                  },
    { urlName: 'Brandhub',              rules: BrandhubRules.get()              },
    { urlName: 'Conspirateurs',         rules: ConspirateursRules.get()         },
    { urlName: 'Lodestone',             rules: LodestoneRules.get()             },
    { urlName: 'MartianChess',          rules: MartianChessRules.get()          },
    { urlName: 'Hnefatafl',             rules: HnefataflRules.get()             },
    { urlName: 'Hive',                  rules: HiveRules.get()                  },
    { urlName: 'Trexo',                 rules: TrexoRules.get()                 },
    { urlName: 'Lasca',                 rules: LascaRules.get()                 },
    { urlName: 'ConnectSix',            rules: ConnectSixRules.get()            },
    { urlName: 'Pente',                 rules: PenteRules.get()                 },
    { urlName: 'Teeko',                 rules: TeekoRules.get()                 },
    { urlName: 'Kalah',                 rules: KalahRules.get()                 },
    { urlName: 'Diaballik',             rules: DiaballikRules.get()             },
    { urlName: 'BaAwa',                 rules: BaAwaRules.get()                 },
    { urlName: 'Squarz',                rules: SquarzRules.get()                },
    { urlName: 'Hexodia',               rules: HexodiaRules.get()               },
    { urlName: 'TriangularGo',          rules: TriangularGoRules.get()          },
    { urlName: 'InternationalCheckers', rules: InternationalCheckersRules.get() },
    { urlName: 'QuebecCastles',         rules: QuebecCastlesRules.get()         },
    { urlName: 'HexagonalGo',           rules: HexagonalGoRules.get()           },
    { urlName: 'ToricReversi',          rules: ToricReversiRules.get()          },
    { urlName: 'Bashni',                rules: BashniRules.get()                },
    { urlName: 'ZoomedGo',              rules: ZoomedGoRules.get()              },
];

describe(`RulesConfigDescriptions`, () => {

    for (const gameInfo of partialGameInfo) {

        const rulesConfigDescription: RulesConfigDescription<RulesConfig> =
            gameInfo.rules.getRulesConfigDescription();

        if (rulesConfigDescription.getFields().length > 0) {
            it(`should have internationalized fields of ${ gameInfo.urlName }`, () => {
                for (const field of rulesConfigDescription.getFields()) {
                    const defaultConfigDescription: DefaultConfigDescription =
                        rulesConfigDescription.defaultConfigDescription;
                    expect(defaultConfigDescription.config[field].title().length).toBeGreaterThan(0);
                }
            });
        }

        it(`should have an internationalized name for each standard config of ${ gameInfo.urlName }`, () => {
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
