/* eslint-disable no-multi-spaces */
import { Component, EventEmitter, Output, Type } from '@angular/core';

import { MGPOptional, Utils } from '@everyboard/lib';

import { AbaloneRules } from '../../../games/abalone/AbaloneRules';
import { AbaloneTutorial } from '../../../games/abalone/AbaloneTutorial';
import { AbaloneComponent } from '../../../games/abalone/abalone.component';
import { ApagosRules } from '../../../games/apagos/ApagosRules';
import { ApagosTutorial } from '../../../games/apagos/ApagosTutorial';
import { ApagosComponent } from '../../../games/apagos/apagos.component';
import { InternationalCheckersRules } from '../../../games/checkers/international-checkers/InternationalCheckersRules';
import { InternationalCheckersTutorial } from '../../../games/checkers/international-checkers/InternationalCheckersTutorial';
import { InternationalCheckersComponent } from '../../../games/checkers/international-checkers/international-checkers.component';
import { LascaRules } from '../../../games/checkers/lasca/LascaRules';
import { LascaTutorial } from '../../../games/checkers/lasca/LascaTutorial';
import { LascaComponent } from '../../../games/checkers/lasca/lasca.component';
import { CoerceoRules } from '../../../games/coerceo/CoerceoRules';
import { CoerceoTutorial } from '../../../games/coerceo/CoerceoTutorial';
import { CoerceoComponent } from '../../../games/coerceo/coerceo.component';
import { ConnectSixRules } from '../../../games/connect-six/ConnectSixRules';
import { ConnectSixTutorial } from '../../../games/connect-six/ConnectSixTutorial';
import { ConnectSixComponent } from '../../../games/connect-six/connect-six.component';
import { ConspirateursRules } from '../../../games/conspirateurs/ConspirateursRules';
import { ConspirateursTutorial } from '../../../games/conspirateurs/ConspirateursTutorial';
import { ConspirateursComponent } from '../../../games/conspirateurs/conspirateurs.component';
import { DiaballikRules } from '../../../games/diaballik/DiaballikRules';
import { DiaballikTutorial } from '../../../games/diaballik/DiaballikTutorial';
import { DiaballikComponent } from '../../../games/diaballik/diaballik.component';
import { DiamRules } from '../../../games/diam/DiamRules';
import { DiamTutorial } from '../../../games/diam/DiamTutorial';
import { DiamComponent } from '../../../games/diam/diam.component';
import { DvonnRules } from '../../../games/dvonn/DvonnRules';
import { DvonnTutorial } from '../../../games/dvonn/DvonnTutorial';
import { DvonnComponent } from '../../../games/dvonn/dvonn.component';
import { EncapsuleRules } from '../../../games/encapsule/EncapsuleRules';
import { EncapsuleTutorial } from '../../../games/encapsule/EncapsuleTutorial';
import { EncapsuleComponent } from '../../../games/encapsule/encapsule.component';
import { EpaminondasRules } from '../../../games/epaminondas/EpaminondasRules';
import { EpaminondasTutorial } from '../../../games/epaminondas/EpaminondasTutorial';
import { EpaminondasComponent } from '../../../games/epaminondas/epaminondas.component';
import { GipfRules } from '../../../games/gipf/GipfRules';
import { GipfTutorial } from '../../../games/gipf/GipfTutorial';
import { GipfComponent } from '../../../games/gipf/gipf.component';
import { GoRules } from '../../../games/gos/go/GoRules';
import { GoTutorial } from '../../../games/gos/go/GoTutorial';
import { GoComponent } from '../../../games/gos/go/go.component';
import { TrigoRules } from '../../../games/gos/trigo/TrigoRules';
import { TrigoTutorial } from '../../../games/gos/trigo/TrigoTutorial';
import { TrigoComponent } from '../../../games/gos/trigo/trigo.component';
import { HexodiaRules } from '../../../games/hexodia/HexodiaRules';
import { HexodiaTutorial } from '../../../games/hexodia/HexodiaTutorial';
import { HexodiaComponent } from '../../../games/hexodia/hexodia.component';
import { HiveRules } from '../../../games/hive/HiveRules';
import { HiveTutorial } from '../../../games/hive/HiveTutorial';
import { HiveComponent } from '../../../games/hive/hive.component';
import { KamisadoRules } from '../../../games/kamisado/KamisadoRules';
import { KamisadoTutorial } from '../../../games/kamisado/KamisadoTutorial';
import { KamisadoComponent } from '../../../games/kamisado/kamisado.component';
import { LinesOfActionRules } from '../../../games/lines-of-action/LinesOfActionRules';
import { LinesOfActionTutorial } from '../../../games/lines-of-action/LinesOfActionTutorial';
import { LinesOfActionComponent } from '../../../games/lines-of-action/lines-of-action.component';
import { LodestoneRules } from '../../../games/lodestone/LodestoneRules';
import { LodestoneTutorial } from '../../../games/lodestone/LodestoneTutorial';
import { LodestoneComponent } from '../../../games/lodestone/lodestone.component';
import { AwaleRules } from '../../../games/mancala/awale/AwaleRules';
import { AwaleTutorial } from '../../../games/mancala/awale/AwaleTutorial';
import { AwaleComponent } from '../../../games/mancala/awale/awale.component';
import { BaAwaRules } from '../../../games/mancala/ba-awa/BaAwaRules';
import { BaAwaTutorial } from '../../../games/mancala/ba-awa/BaAwaTutorial';
import { BaAwaComponent } from '../../../games/mancala/ba-awa/ba-awa.component';
import { KalahRules } from '../../../games/mancala/kalah/KalahRules';
import { KalahTutorial } from '../../../games/mancala/kalah/KalahTutorial';
import { KalahComponent } from '../../../games/mancala/kalah/kalah.component';
import { MartianChessRules } from '../../../games/martian-chess/MartianChessRules';
import { MartianChessTutorial } from '../../../games/martian-chess/MartianChessTutorial';
import { MartianChessComponent } from '../../../games/martian-chess/martian-chess.component';
import { P4Rules } from '../../../games/p4/P4Rules';
import { P4Tutorial } from '../../../games/p4/P4Tutorial';
import { P4Component } from '../../../games/p4/p4.component';
import { PentagoRules } from '../../../games/pentago/PentagoRules';
import { PentagoTutorial } from '../../../games/pentago/PentagoTutorial';
import { PentagoComponent } from '../../../games/pentago/pentago.component';
import { PenteRules } from '../../../games/pente/PenteRules';
import { PenteTutorial } from '../../../games/pente/PenteTutorial';
import { PenteComponent } from '../../../games/pente/pente.component';
import { PylosRules } from '../../../games/pylos/PylosRules';
import { PylosTutorial } from '../../../games/pylos/PylosTutorial';
import { PylosComponent } from '../../../games/pylos/pylos.component';
import { QuartoRules } from '../../../games/quarto/QuartoRules';
import { QuartoTutorial } from '../../../games/quarto/QuartoTutorial';
import { QuartoComponent } from '../../../games/quarto/quarto.component';
import { QuebecCastlesRules } from '../../../games/quebec-castles/QuebecCastlesRules';
import { QuebecCastlesTutorial } from '../../../games/quebec-castles/QuebecCastlesTutorial';
import { QuebecCastlesComponent } from '../../../games/quebec-castles/quebec-castles.component';
import { QuixoRules } from '../../../games/quixo/QuixoRules';
import { QuixoTutorial } from '../../../games/quixo/QuixoTutorial';
import { QuixoComponent } from '../../../games/quixo/quixo.component';
import { ReversiRules } from '../../../games/reversi/ReversiRules';
import { ReversiTutorial } from '../../../games/reversi/ReversiTutorial';
import { ReversiComponent } from '../../../games/reversi/reversi.component';
import { SaharaRules } from '../../../games/sahara/SaharaRules';
import { SaharaTutorial } from '../../../games/sahara/SaharaTutorial';
import { SaharaComponent } from '../../../games/sahara/sahara.component';
import { SiamRules } from '../../../games/siam/SiamRules';
import { SiamTutorial } from '../../../games/siam/SiamTutorial';
import { SiamComponent } from '../../../games/siam/siam.component';
import { SixRules } from '../../../games/six/SixRules';
import { SixTutorial } from '../../../games/six/SixTutorial';
import { SixComponent } from '../../../games/six/six.component';
import { SquarzRules } from '../../../games/squarz/SquarzRules';
import { SquarzTutorial } from '../../../games/squarz/SquarzTutorial';
import { SquarzComponent } from '../../../games/squarz/squarz.component';
import { BrandhubRules } from '../../../games/tafl/brandhub/BrandhubRules';
import { BrandhubTutorial } from '../../../games/tafl/brandhub/BrandhubTutorial';
import { BrandhubComponent } from '../../../games/tafl/brandhub/brandhub.component';
import { HnefataflRules } from '../../../games/tafl/hnefatafl/HnefataflRules';
import { HnefataflTutorial } from '../../../games/tafl/hnefatafl/HnefataflTutorial';
import { HnefataflComponent } from '../../../games/tafl/hnefatafl/hnefatafl.component';
import { TablutRules } from '../../../games/tafl/tablut/TablutRules';
import { TablutTutorial } from '../../../games/tafl/tablut/TablutTutorial';
import { TablutComponent } from '../../../games/tafl/tablut/tablut.component';
import { TeekoRules } from '../../../games/teeko/TeekoRules';
import { TeekoTutorial } from '../../../games/teeko/TeekoTutorial';
import { TeekoComponent } from '../../../games/teeko/teeko.component';
import { TrexoRules } from '../../../games/trexo/TrexoRules';
import { TrexoTutorial } from '../../../games/trexo/TrexoTutorial';
import { TrexoComponent } from '../../../games/trexo/trexo.component';
import { YinshRules } from '../../../games/yinsh/YinshRules';
import { YinshTutorial } from '../../../games/yinsh/YinshTutorial';
import { YinshComponent } from '../../../games/yinsh/yinsh.component';
import { AbstractRules } from '../../../jscaip/Rules';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { GameState } from '../../../jscaip/state/GameState';
import { ThemeService } from '../../../services/ThemeService';
import { Localized } from '../../../utils/LocaleUtils';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { RulesConfigDescription } from '../../wrapper-components/rules-configuration/RulesConfigDescription';
import { Tutorial } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';

class GameDescription {

    public static readonly ABALONE: Localized = () => $localize`Use simple mechanics to push 6 of the opponent's pieces out of the board!`;

    public static readonly APAGOS: Localized = () => $localize`Very simple game, but, will you be able to win everytime?`;

    public static readonly AWALE: Localized = () => $localize`The most widespread of the Mancalas.`;

    public static readonly BA_AWA: Localized = () => $localize`The most widespread multiple-lap Mancala.`;

    public static readonly BRANDHUB: Localized = () => $localize`The Irish version of the Tafl game family! Invaders must capture the king, defender must make him escape!`;

    public static readonly COERCEO: Localized = () => $localize`Get rid of all of your opponent's pieces on a board that shrinks little by little!`;

    public static readonly CONNECT_SIX: Localized = () => $localize`Put two pieces on the board at each turn, and be the first to align six pieces!`;

    public static readonly CONSPIRATEURS: Localized = () => $localize`Hide all of your pieces before your opponent does, or risk to be discovered!`;

    public static readonly DIABALLIK: Localized = () => $localize`Pass the ball up to the side of the opponent to win the game!`;

    public static readonly DIAM: Localized = () => $localize`Drop your pieces and move them around to align two pieces of the same color across the board to win!`;

    public static readonly DVONN: Localized = () => $localize`Stack your pieces and control as many stacks as you can to win!`;

    public static readonly ENCAPSULE: Localized = () => $localize`An enhanced tic-tac-toe where piece can encapsule other and prevent them to win.`;

    public static readonly EPAMINONDAS: Localized = () => $localize`An antiquity-war inspired game. Be the first to pierce your opponent's lines!`;

    public static readonly GIPF: Localized = () => $localize`A hexagonal game of alignment. Insert your pieces on the board to capture your opponent's pieces!`;

    public static readonly GO: Localized = () => $localize`The oldest strategy game still practiced widely. A territory control game.`;

    public static readonly HEXODIA: Localized = () => $localize`A hexagonal alignment game with weird "diagonals"!`;

    public static readonly HIVE: Localized = () => $localize`You are in charge of a hive full of insects. Use the abilities of your insects to block the opponent's queen in order to win!`;

    public static readonly INTERNATIONAL_CHECKERS: Localized = () => $localize`The famous checkers game (international version)`;

    public static readonly HNEFATAFL: Localized = () => $localize`The Viking board game! Invaders must capture the king, defender must make him escape!`;

    public static readonly KALAH: Localized = () => $localize`A modern version of the famous African strategy game!`;

    public static readonly KAMISADO: Localized = () => $localize`Your goal is simple: reach the last line. But the piece you move depends on your opponent's last move!`;

    public static readonly LASCA: Localized = () => $localize`Similar to checkers, capture opponent's pieces, free your own, and immobilize your opponent to win the game!`;

    public static readonly LINES_OF_ACTION: Localized = () => $localize`Regroup your pieces to win. But your possible moves will often change!`;

    public static readonly LODESTONE: Localized = () => $localize`Push and crush your opponent's pieces using magnetic forces!`;

    public static readonly MARTIAN_CHESS: Localized = () => $localize`Win points by capturing pieces, but you only control pieces on your side of the board!`;

    public static readonly P4: Localized = () => $localize`The classical 4 in a row game!`;

    public static readonly PENTAGO: Localized = () => $localize`Drop a piece, then rotate a quadrant. The first player to align 5 pieces wins!`;

    public static readonly PENTE: Localized = () => $localize`You can align 5 pieces to win, or you can capture 10 pieces of your opponent to win!`;

    public static readonly PYLOS: Localized = () => $localize`Overlay your pieces and use two game mechanics to conserve your pieces. First player to run out of pieces loses!`;

    public static readonly QUARTO: Localized = () => $localize`Create a winning alignment. The problem: you don't pick the piece that you're placing on the board!`;

    public static readonly QUEBEC_CASTLES: Localized = () => $localize`EveryBoard's first game: an asymmetric game where each player moves differently. Be the first one to capture the opponent's throne!`;

    public static readonly QUIXO: Localized = () => $localize`Align 5 of your pieces on a board where pieces slide!`;

    public static readonly REVERSI: Localized = () => $localize`Sandwich your opponent's pieces to dominate the board!`;

    public static readonly SAHARA: Localized = () => $localize`Immobilize one of your opponent's pyramids before your opponent does!`;

    public static readonly SIAM: Localized = () => $localize`Be the first to push a mountain out of the board!`;

    public static readonly SIX: Localized = () => $localize`Put your hexagonal pieces next to another one, and create one of the 3 victorious shapes to win!`;

    public static readonly SQUARZ: Localized = () => $localize`Duplicate yourself to conquer the board!`;

    public static readonly TABLUT: Localized = () => $localize`Lapland version of the Tafl game family! Invaders must capture the king, defender must make him escape!`;

    public static readonly TEEKO: Localized = () => $localize`Align your 4 pieces or form a square with them to win!`;

    public static readonly TREXO: Localized = () => $localize`Align 5 pieces of your color in a row, but beware, the pieces can be put on top of other pieces!`;

    public static readonly TRI_GO: Localized = () => $localize`A version of Go on triangular spaces!`;

    public static readonly YINSH: Localized = () => $localize`Align your pieces to score points, but beware, pieces can flip!`;

}

export class GameInfo {

    private static ALL_GAMES: GameInfo[] = []; // Initialized like a singleton

    // Games sorted by creation date
    public static getAllGames(): GameInfo[] {
        if (GameInfo.ALL_GAMES.length === 0) {
            GameInfo.fillAllGames();
        }
        return GameInfo.ALL_GAMES;
    }

    // eslint-disable-next-line max-lines-per-function
    private static fillAllGames(): void {
        GameInfo.ALL_GAMES = [
            new GameInfo($localize`Four in a Row`,          'P4',                    P4Component,                    new P4Tutorial(),                    P4Rules.get(),                    new Date('2018-08-28'), GameDescription.P4()                    ), //  0:                             * Martin
            new GameInfo($localize`Awalé`,                  'Awale',                 AwaleComponent,                 new AwaleTutorial(),                 AwaleRules.get(),                 new Date('2018-11-29'), GameDescription.AWALE()                 ), //  1: 93 days after P4            * Martin
            new GameInfo($localize`Quarto`,                 'Quarto',                QuartoComponent,                new QuartoTutorial(),                QuartoRules.get(),                new Date('2018-12-09'), GameDescription.QUARTO()                ), //  2: 10 days after Awale         * Martin
            new GameInfo($localize`Tablut`,                 'Tablut',                TablutComponent,                new TablutTutorial(),                TablutRules.get(),                new Date('2018-12-27'), GameDescription.TABLUT()                ), //  3: 26 days after Quarto        * Martin

            new GameInfo($localize`Reversi`,                'Reversi',               ReversiComponent,               new ReversiTutorial(),               ReversiRules.get(),               new Date('2019-01-16'), GameDescription.REVERSI()               ), //  4: 20 days after Tablut        * Martin
            new GameInfo($localize`Go`,                     'Go',                    GoComponent,                    new GoTutorial(),                    GoRules.get(),                    new Date('2019-12-21'), GameDescription.GO()                    ), //  5: 11 months after Reversi     * Martin
            new GameInfo($localize`Encapsule`,              'Encapsule',             EncapsuleComponent,             new EncapsuleTutorial(),             EncapsuleRules.get(),             new Date('2019-12-30'), GameDescription.ENCAPSULE()             ), //  6: 9 days after Go             * Martin

            new GameInfo($localize`Siam`,                   'Siam',                  SiamComponent,                  new SiamTutorial(),                  SiamRules.get(),                  new Date('2020-01-11'), GameDescription.SIAM()                  ), //  7: 12 days after Encapsule     * Martin
            new GameInfo($localize`Sahara`,                 'Sahara',                SaharaComponent,                new SaharaTutorial(),                SaharaRules.get(),                new Date('2020-02-29'), GameDescription.SAHARA()                ), //  8: 49 days after Siam          * Martin
            new GameInfo($localize`Pylos`,                  'Pylos',                 PylosComponent,                 new PylosTutorial(),                 PylosRules.get(),                 new Date('2020-10-02'), GameDescription.PYLOS()                 ), //  9: 7 months after Sahara       * Martin
            new GameInfo($localize`Kamisado`,               'Kamisado',              KamisadoComponent,              new KamisadoTutorial(),              KamisadoRules.get(),              new Date('2020-10-03'), GameDescription.KAMISADO()              ), // 10: 26 days after joining       * Quentin
            new GameInfo($localize`Quixo`,                  'Quixo',                 QuixoComponent,                 new QuixoTutorial(),                 QuixoRules.get(),                 new Date('2020-10-15'), GameDescription.QUIXO()                 ), // 11: 13 days after Pylos         * Martin
            new GameInfo($localize`Dvonn`,                  'Dvonn',                 DvonnComponent,                 new DvonnTutorial(),                 DvonnRules.get(),                 new Date('2020-10-21'), GameDescription.DVONN()                 ), // 12: 18 days after Kamisado      * Quentin

            new GameInfo($localize`Epaminondas`,            'Epaminondas',           EpaminondasComponent,           new EpaminondasTutorial(),           EpaminondasRules.get(),           new Date('2021-01-16'), GameDescription.EPAMINONDAS()           ), // 13: 22 days after Quixo         * Martin
            new GameInfo($localize`Gipf`,                   'Gipf',                  GipfComponent,                  new GipfTutorial(),                  GipfRules.get(),                  new Date('2021-02-22'), GameDescription.GIPF()                  ), // 14: 4 months after Dvonn        * Quentin
            new GameInfo($localize`Coerceo`,                'Coerceo',               CoerceoComponent,               new CoerceoTutorial(),               CoerceoRules.get(),               new Date('2021-03-21'), GameDescription.COERCEO()               ), // 15: 76 days after Epaminondas   * Martin
            new GameInfo($localize`Six`,                    'Six',                   SixComponent,                   new SixTutorial(),                   SixRules.get(),                   new Date('2021-04-08'), GameDescription.SIX()                   ), // 16: 18 days after Coerceo       * Martin
            new GameInfo($localize`Lines of Action`,        'LinesOfAction',         LinesOfActionComponent,         new LinesOfActionTutorial(),         LinesOfActionRules.get(),         new Date('2021-04-28'), GameDescription.LINES_OF_ACTION()       ), // 17: 65 days after Gipf          * Quentin
            new GameInfo($localize`Pentago`,                'Pentago',               PentagoComponent,               new PentagoTutorial(),               PentagoRules.get(),               new Date('2021-05-23'), GameDescription.PENTAGO()               ), // 18: 25 days after Six           * Martin
            new GameInfo($localize`Abalone`,                'Abalone',               AbaloneComponent,               new AbaloneTutorial(),               AbaloneRules.get(),               new Date('2021-07-13'), GameDescription.ABALONE()               ), // 19: 71 days after Pentago       * Martin
            new GameInfo($localize`Yinsh`,                  'Yinsh',                 YinshComponent,                 new YinshTutorial(),                 YinshRules.get(),                 new Date('2021-07-31'), GameDescription.YINSH()                 ), // 20: 94 days after LinesOfAction * Quentin
            new GameInfo($localize`Apagos`,                 'Apagos',                ApagosComponent,                new ApagosTutorial(),                ApagosRules.get(),                new Date('2021-11-04'), GameDescription.APAGOS()                ), // 21: 4 month after Abalone       * Martin
            new GameInfo($localize`Diam`,                   'Diam',                  DiamComponent,                  new DiamTutorial(),                  DiamRules.get(),                  new Date('2021-11-30'), GameDescription.DIAM()                  ), // 22: 4 months after Yinsh        * Quentin
            new GameInfo($localize`Brandhub`,               'Brandhub',              BrandhubComponent,              new BrandhubTutorial(),              BrandhubRules.get(),              new Date('2021-12-07'), GameDescription.BRANDHUB()              ), // 23: 33 days after Apagos        * Martin
            new GameInfo($localize`Conspirateurs`,          'Conspirateurs',         ConspirateursComponent,         new ConspirateursTutorial(),         ConspirateursRules.get(),         new Date('2021-12-30'), GameDescription.CONSPIRATEURS()         ), // 24: 30 days after Diam          * Quentin

            new GameInfo($localize`Lodestone`,              'Lodestone',             LodestoneComponent,             new LodestoneTutorial(),             LodestoneRules.get(),             new Date('2022-06-24'), GameDescription.LODESTONE()             ), // 25:                             * Quentin
            new GameInfo($localize`Martian Chess`,          'MartianChess',          MartianChessComponent,          new MartianChessTutorial(),          MartianChessRules.get(),          new Date('2022-07-01'), GameDescription.MARTIAN_CHESS()         ), // 26:                             * Martin
            new GameInfo($localize`Hnefatafl`,              'Hnefatafl',             HnefataflComponent,             new HnefataflTutorial(),             HnefataflRules.get(),             new Date('2022-09-21'), GameDescription.HNEFATAFL()             ), // 27:                             * Martin

            new GameInfo($localize`Hive`,                   'Hive',                  HiveComponent,                  new HiveTutorial(),                  HiveRules.get(),                  new Date('2023-04-02'), GameDescription.HIVE()                  ), // 28:                             * Quentin
            new GameInfo($localize`Trexo`,                  'Trexo',                 TrexoComponent,                 new TrexoTutorial(),                 TrexoRules.get(),                 new Date('2023-04-23'), GameDescription.TREXO()                 ), // 29:                             * Martin
            new GameInfo($localize`Lasca`,                  'Lasca',                 LascaComponent,                 new LascaTutorial(),                 LascaRules.get(),                 new Date('2023-05-11'), GameDescription.LASCA()                 ), // 30:                             * Martin
            new GameInfo($localize`Connect Six`,            'ConnectSix',            ConnectSixComponent,            new ConnectSixTutorial(),            ConnectSixRules.get(),            new Date('2023-05-13'), GameDescription.CONNECT_SIX()           ), // 31:                             * Martin
            new GameInfo($localize`Pente`,                  'Pente',                 PenteComponent,                 new PenteTutorial(),                 PenteRules.get(),                 new Date('2023-05-20'), GameDescription.PENTE()                 ), // 32:                             * Quentin
            new GameInfo($localize`Teeko`,                  'Teeko',                 TeekoComponent,                 new TeekoTutorial(),                 TeekoRules.get(),                 new Date('2023-07-30'), GameDescription.TEEKO()                 ), // 33:                             * Martin
            new GameInfo($localize`Kalah`,                  'Kalah',                 KalahComponent,                 new KalahTutorial(),                 KalahRules.get(),                 new Date('2023-09-07'), GameDescription.KALAH()                 ), // 34:                             * Martin
            new GameInfo($localize`Diaballik`,              'Diaballik',             DiaballikComponent,             new DiaballikTutorial(),             DiaballikRules.get(),             new Date('2023-11-18'), GameDescription.DIABALLIK()             ), // 35:                             * Quentin

            new GameInfo($localize`Ba-awa`,                 'BaAwa',                 BaAwaComponent,                 new BaAwaTutorial(),                 BaAwaRules.get(),                 new Date('2024-01-28'), GameDescription.BA_AWA()                ), // 36:                             * Martin
            new GameInfo($localize`Squarz`,                 'Squarz',                SquarzComponent,                new SquarzTutorial(),                SquarzRules.get(),                new Date('2024-05-08'), GameDescription.SQUARZ()                ), // 37:                             * Martin
            new GameInfo($localize`Hexodia`,                'Hexodia',               HexodiaComponent,               new HexodiaTutorial(),               HexodiaRules.get(),               new Date('2024-06-26'), GameDescription.HEXODIA()               ), // 38:                             * Martin
            new GameInfo($localize`Trigo`,                  'Trigo',                 TrigoComponent,                 new TrigoTutorial(),                 TrigoRules.get(),                 new Date('2024-06-29'), GameDescription.TRI_GO()                ), // 39:                             * Martin

            new GameInfo($localize`International Checkers`, 'InternationalCheckers', InternationalCheckersComponent, new InternationalCheckersTutorial(), InternationalCheckersRules.get(), new Date('2025-02-03'), GameDescription.INTERNATIONAL_CHECKERS()), // 40:                             * Martin
            new GameInfo($localize`Quebec Castles`,         'QuebecCastles',         QuebecCastlesComponent,         new QuebecCastlesTutorial(),         QuebecCastlesRules.get(),         new Date('2025-09-29'), GameDescription.QUEBEC_CASTLES()        ), // 41:                             * Martin
        ].sort((a: GameInfo, b: GameInfo) => a.name.localeCompare(b.name));
        // After Apagos: median = 26d; average = 53d
        // 9d 10d 12d 13d 18d - 18d 20d 22d 25d 26d - (26d) - 49d 65d 71d 76d 93d - 94j 4m 4m 7m 11m
    }

    public static getByUrlName(urlName: string): MGPOptional<GameInfo> {
        const games: GameInfo[] = GameInfo.getAllGames().filter((gameInfo: GameInfo) => gameInfo.urlName === urlName);
        Utils.assert(games.length <= 1, `There should only be one game matching $urlName!`);
        if (games.length === 0) {
            return MGPOptional.empty();
        } else {
            return MGPOptional.of(games[0]);
        }
    }

    public static getStateProvider(urlName: string): MGPOptional<(config: MGPOptional<RulesConfig>) => GameState> {
        return GameInfo.getByUrlName(urlName).map((info: GameInfo) => {
            return (config: MGPOptional<RulesConfig>) => {
                return info.rules.getInitialState(config);
            };
        });
    }

    public constructor(public readonly name: string,
                       public readonly urlName: string,
                       public readonly component: Type<AbstractGameComponent>,
                       public readonly tutorial: Tutorial,
                       public readonly rules: AbstractRules,
                       public readonly creationDate: Date,
                       public readonly description: string,
                       public readonly display: boolean = true)
    {
    }

    public getRulesConfigDescription(): MGPOptional<RulesConfigDescription<RulesConfig>> {
        return this.rules.getRulesConfigDescription();
    }

    public getRulesConfig(): MGPOptional<RulesConfig> {
        const description: MGPOptional<RulesConfigDescription<RulesConfig>> = this.getRulesConfigDescription();
        if (description.isPresent()) {
            return MGPOptional.of(description.get().getDefaultConfig().config);
        } else {
            return MGPOptional.empty();
        }
    }

}

@Component({
    selector: 'app-pick-game',
    templateUrl: './pick-game.component.html',
    standalone: false
})
export class PickGameComponent {

    public readonly games: GameInfo[] = GameInfo.getAllGames();

    public readonly theme: 'dark' | 'light';

    public matchingGames: GameInfo[] = this.games;

    @Output() pickGame: EventEmitter<string> = new EventEmitter<string>();

    public constructor(themeService: ThemeService) {
        this.theme = themeService.getTheme();
    }

    public selectGame(gameName: string): void {
        this.pickGame.emit(gameName);
    }

    public search(input: EventTarget | null): void {
        const searchTerm: string = (input as HTMLInputElement).value;
        this.matchingGames = this.games.filter((info: GameInfo) =>
            this.normalize(info.name).includes(this.normalize(searchTerm)));
    }

    private normalize(term: string): string {
        return term.toLowerCase() // we want to be case insensitive
            .replace(/ /g, '') // we want to be space insensitive
            // we also want to be diacritic-insensitive, but we have to resort to black magic incantations for that
            .normalize('NFKD').replace(/[^\w]/g, '');
        // Explanation: normalize('NFKD') performs "compatibility
        // decomposition", basically splitting the diacritic from the character
        // into two different code points, e.g., é is split between ´ and e, at
        // the Unicode level. The replace part removes the code points that are
        // not characters, thereby removing all diacritics. This is not the work
        // of Morgoth as one may think, but regular Unicode manipulation.
    }
}
