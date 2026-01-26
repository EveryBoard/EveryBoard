/* eslint-disable no-multi-spaces */
import { MGPOptional, Utils } from '@everyboard/lib';

import { AbaloneComponent } from '../../../games/abalone/abalone.component';
import { ApagosComponent } from '../../../games/apagos/apagos.component';
import { AwaleComponent } from '../../../games/mancala/awale/awale.component';

import { BaAwaComponent } from '../../../games/mancala/ba-awa/ba-awa.component';
import { BrandhubComponent } from '../../../games/tafl/brandhub/brandhub.component';

import { ConnectSixComponent } from '../../../games/connect-six/connect-six.component';
import { ConspirateursComponent } from '../../../games/conspirateurs/conspirateurs.component';

import { CoerceoComponent } from '../../../games/coerceo/coerceo.component';

import { DiaballikComponent } from '../../../games/diaballik/diaballik.component';
import { DiamComponent } from '../../../games/diam/diam.component';
import { DvonnComponent } from '../../../games/dvonn/dvonn.component';

import { EncapsuleComponent } from '../../../games/encapsule/encapsule.component';
import { EpaminondasComponent } from '../../../games/epaminondas/epaminondas.component';

import { GipfComponent } from '../../../games/gipf/gipf.component';
import { GoComponent } from '../../../games/gos/go/go.component';

import { HexodiaComponent } from '../../../games/hexodia/hexodia.component';
import { HiveComponent } from '../../../games/hive/hive.component';
import { HnefataflComponent } from '../../../games/tafl/hnefatafl/hnefatafl.component';

import { InternationalCheckersComponent } from '../../../games/checkers/international-checkers/international-checkers.component';

import { KalahComponent } from '../../../games/mancala/kalah/kalah.component';
import { KamisadoComponent } from '../../../games/kamisado/kamisado.component';

import { LascaComponent } from '../../../games/checkers/lasca/lasca.component';
import { LinesOfActionComponent } from '../../../games/lines-of-action/lines-of-action.component';
import { LodestoneComponent } from '../../../games/lodestone/lodestone.component';

import { MartianChessComponent } from '../../../games/martian-chess/martian-chess.component';

import { P4Component } from '../../../games/p4/p4.component';
import { PentagoComponent } from '../../../games/pentago/pentago.component';
import { PenteComponent } from '../../../games/pente/pente.component';
import { PylosComponent } from '../../../games/pylos/pylos.component';

import { QuartoComponent } from '../../../games/quarto/quarto.component';
import { QuebecCastlesComponent } from 'src/src/app/games/quebec-castles/quebec-castles.component';
import { QuixoComponent } from '../../../games/quixo/quixo.component';

import { ReversiComponent } from '../../../games/reversi/reversi.component';

import { SaharaComponent } from '../../../games/sahara/sahara.component';
import { SiamComponent } from '../../../games/siam/siam.component';
import { SixComponent } from '../../../games/six/six.component';
import { SquarzComponent } from '../../../games/squarz/squarz.component';

import { TablutComponent } from '../../../games/tafl/tablut/tablut.component';
import { TeekoComponent } from '../../../games/teeko/teeko.component';
import { TrexoComponent } from '../../../games/trexo/trexo.component';
import { TrigoComponent } from '../../../games/gos/trigo/trigo.component';

import { YinshComponent } from '../../../games/yinsh/yinsh.component';

import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { Type } from '@angular/core';

export class ComponentInfo {

    private static ALL_GAMES: ComponentInfo[] = []; // Initialized like a singleton

    // Games sorted by creation date
    public static getAllGames(): ComponentInfo[] {
        if (ComponentInfo.ALL_GAMES.length === 0) {
            ComponentInfo.fillAllGames();
        }
        return ComponentInfo.ALL_GAMES;
    }

    // eslint-disable-next-line max-lines-per-function
    private static fillAllGames(): void {
        ComponentInfo.ALL_GAMES = [
            new ComponentInfo('P4',                    P4Component                   ),
            new ComponentInfo('Awale',                 AwaleComponent                ),
            new ComponentInfo('Quarto',                QuartoComponent               ),
            new ComponentInfo('Tablut',                TablutComponent               ),
            new ComponentInfo('Reversi',               ReversiComponent              ),
            new ComponentInfo('Go',                    GoComponent                   ),
            new ComponentInfo('Encapsule',             EncapsuleComponent            ),
            new ComponentInfo('Siam',                  SiamComponent                 ),
            new ComponentInfo('Sahara',                SaharaComponent               ),
            new ComponentInfo('Pylos',                 PylosComponent                ),
            new ComponentInfo('Kamisado',              KamisadoComponent             ),
            new ComponentInfo('Quixo',                 QuixoComponent                ),
            new ComponentInfo('Dvonn',                 DvonnComponent                ),
            new ComponentInfo('Epaminondas',           EpaminondasComponent          ),
            new ComponentInfo('Gipf',                  GipfComponent                 ),
            new ComponentInfo('Coerceo',               CoerceoComponent              ),
            new ComponentInfo('Six',                   SixComponent                  ),
            new ComponentInfo('LinesOfAction',         LinesOfActionComponent        ),
            new ComponentInfo('Pentago',               PentagoComponent              ),
            new ComponentInfo('Abalone',               AbaloneComponent              ),
            new ComponentInfo('Yinsh',                 YinshComponent                ),
            new ComponentInfo('Apagos',                ApagosComponent               ),
            new ComponentInfo('Diam',                  DiamComponent                 ),
            new ComponentInfo('Brandhub',              BrandhubComponent             ),
            new ComponentInfo('Conspirateurs',         ConspirateursComponent        ),
            new ComponentInfo('Lodestone',             LodestoneComponent            ),
            new ComponentInfo('MartianChess',          MartianChessComponent         ),
            new ComponentInfo('Hnefatafl',             HnefataflComponent            ),
            new ComponentInfo('Hive',                  HiveComponent                 ),
            new ComponentInfo('Trexo',                 TrexoComponent                ),
            new ComponentInfo('Lasca',                 LascaComponent                ),
            new ComponentInfo('ConnectSix',            ConnectSixComponent           ),
            new ComponentInfo('Pente',                 PenteComponent                ),
            new ComponentInfo('Teeko',                 TeekoComponent                ),
            new ComponentInfo('Kalah',                 KalahComponent                ),
            new ComponentInfo('Diaballik',             DiaballikComponent            ),
            new ComponentInfo('BaAwa',                 BaAwaComponent                ),
            new ComponentInfo('Squarz',                SquarzComponent               ),
            new ComponentInfo('Hexodia',               HexodiaComponent              ),
            new ComponentInfo('Trigo',                 TrigoComponent                ),
            new ComponentInfo('InternationalCheckers', InternationalCheckersComponent),
            new ComponentInfo('QuebecCastles',         QuebecCastlesComponent        ),
        ].sort((a: ComponentInfo, b: ComponentInfo) => a.urlName.localeCompare(b.urlName));
    }

    public static getByUrlName(urlName: string): MGPOptional<ComponentInfo> {
        const games: ComponentInfo[] = ComponentInfo
            .getAllGames()
            .filter((gameInfo: ComponentInfo) => gameInfo.urlName === urlName);
        Utils.assert(games.length <= 1, `There should only be one game matching $urlName!`);
        if (games.length === 0) {
            return MGPOptional.empty();
        } else {
            return MGPOptional.of(games[0]);
        }
    }

    public constructor(public readonly urlName: string,
                       public readonly component: Type<AbstractGameComponent>)
    {
    }

}
