/* eslint-disable max-lines-per-function */
import { BrandhubComponent } from '../brandhub.component';
import { BrandhubRules } from '../BrandhubRules';
import { BrandhubMove } from '../BrandhubMove';
import { BrandhubState } from '../BrandhubState';
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from '../../TaflPawn';
import { DoTaflTests, TaflTestEntries } from '../../tests/GenericTaflTest.spec';
import { TaflConfig } from '../../TaflConfig';

const _: TaflPawn = TaflPawn.UNOCCUPIED;
const x: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
const i: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
const config: TaflConfig = BrandhubRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;
const stateReadyForCapture: BrandhubState = new BrandhubState([
    [_, A, _, _, _, _, _],
    [_, x, x, _, _, _, _],
    [_, _, i, _, _, _, _],
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
], 1, config);

const brandhubEntries: TaflTestEntries<BrandhubComponent, BrandhubRules, BrandhubMove, BrandhubState> = {
    gameName: 'Brandhub',
    component: BrandhubComponent,
    secondPlayerPiece: new Coord(3, 2),
    validFirstCoord: new Coord(3, 0),
    moveProvider: BrandhubMove.of,
    validSecondCoord: new Coord(2, 0),
    diagonalSecondCoord: new Coord(2, 1),
    stateReadyForCapture,
    capture: BrandhubMove.of(new Coord(1, 0), new Coord(2, 0)),
    firstCaptured: new Coord(2, 1),
    otherPlayerPiece: new Coord(3, 1),
    stateReadyForJumpOver: stateReadyForCapture,
    jumpOver: BrandhubMove.of(new Coord(1, 0), new Coord(1, 4)),
};
DoTaflTests(brandhubEntries);
