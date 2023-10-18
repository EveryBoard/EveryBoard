/* eslint-disable max-lines-per-function */
import { HnefataflComponent } from '../hnefatafl.component';
import { HnefataflRules } from '../HnefataflRules';
import { HnefataflMove } from '../HnefataflMove';
import { HnefataflState } from '../HnefataflState';
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from '../../TaflPawn';
import { DoTaflTests, TaflTestEntries } from '../../tests/GenericTaflTest.spec';

const _: TaflPawn = TaflPawn.UNOCCUPIED;
const x: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
const i: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
const stateReadyForCapture: HnefataflState = new HnefataflState([
    [_, A, _, _, _, _, _, _, _, _, _],
    [_, x, x, _, _, _, _, _, _, _, _],
    [_, _, i, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _],
], 1, HnefataflRules.DEFAULT_CONFIG);

const hnefataflEntries: TaflTestEntries<HnefataflComponent, HnefataflRules, HnefataflMove, HnefataflState> = {
    gameName: 'Hnefatafl',
    component: HnefataflComponent,
    secondPlayerPiece: new Coord(5, 3),
    validFirstCoord: new Coord(3, 0),
    moveProvider: HnefataflMove.of,
    validSecondCoord: new Coord(2, 0),
    diagonalSecondCoord: new Coord(2, 1),
    stateReadyForCapture,
    capture: HnefataflMove.of(new Coord(1, 0), new Coord(2, 0)),
    firstCaptured: new Coord(2, 1),
    otherPlayerPiece: new Coord(7, 0),
    stateReadyForJumpOver: stateReadyForCapture,
    jumpOver: HnefataflMove.of(new Coord(1, 0), new Coord(1, 4)),
};
DoTaflTests(hnefataflEntries);
