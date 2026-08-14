import { GroupDataFactory } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { Direction } from '@everyboard/games';
import { HexaDirection } from '@everyboard/games';
import { Orthogonal } from '@everyboard/games';
import { TriangularCheckerBoard } from '@everyboard/games';

import { GoGroupData } from './GoGroupsData';
import { GoPiece } from './GoPiece';

export abstract class GoGroupDataFactory extends GroupDataFactory<GoPiece, GoGroupData> {

    public getNewInstance(color: GoPiece): GoGroupData {
        return new GoGroupData(color, [], [], [], [], [], []);
    }

}

export class OrthogonalGoGroupDataFactory extends GoGroupDataFactory {

    public getDirections(_: Coord): ReadonlyArray<Direction> {
        return Orthogonal.ORTHOGONALS;
    }

}

export class TriangularGoGroupDataFactory extends GoGroupDataFactory {

    public getDirections(coord: Coord): ReadonlyArray<Direction> {
        return TriangularCheckerBoard.getDirections(coord);
    }

}

export class HexagonalGoGroupDataFactory extends GoGroupDataFactory {

    public getDirections(_: Coord): ReadonlyArray<Direction> {
        return HexaDirection.factory.all;
    }

}
