/* eslint-disable max-lines-per-function */
import { TablutMove } from 'src/app/games/tafl/tablut/TablutMove';
import { Coord } from 'src/app/jscaip/Coord';
import { TablutRules } from '../TablutRules';
import { TaflPawn } from '../../TaflPawn';
import { DoTaflTests, TaflTestEntries } from '../../tests/GenericTaflTest.spec';
import { TablutComponent } from '../tablut.component';
import { TaflConfig } from '../../TaflConfig';
import { TaflState } from '../../TaflState';

const _: TaflPawn = TaflPawn.UNOCCUPIED;
const x: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
const i: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

const defaultConfig: TaflConfig = TablutRules.RULES_CONFIG_DESCRIPTION.defaultConfig.config;

const tablutEntries: TaflTestEntries<TablutComponent, TablutRules, TablutMove> = {
    component: TablutComponent,
    gameName: 'Tablut',
    secondPlayerPiece: new Coord(4, 4),
    validFirstCoord: new Coord(4, 1),
    moveProvider: TablutMove.of,
    validSecondCoord: new Coord(1, 1),
    diagonalSecondCoord: new Coord(5, 2),
    stateReadyForCapture: new TaflState([
        [_, A, _, _, _, _, _, _, _],
        [_, x, x, _, _, _, _, _, _],
        [_, _, i, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _],
    ], 1),
    capture: TablutMove.of(new Coord(1, 0), new Coord(2, 0)),
    firstCaptured: new Coord(2, 1),
    otherPlayerPiece: new Coord(5, 0),
    stateReadyForJumpOver: TablutRules.get().getInitialState(defaultConfig),
    jumpOver: TablutMove.of(new Coord(5, 0), new Coord(5, 5)),
};
DoTaflTests(tablutEntries);
