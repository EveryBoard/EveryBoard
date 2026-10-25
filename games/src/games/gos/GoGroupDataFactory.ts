import { GroupDataFactory } from '../../jscaip/BoardData';
import { Coord } from '../../jscaip/Coord';
import { Direction } from '../../jscaip/direction/Direction';
import { HexaDirection } from '../../jscaip/direction/HexaDirection';
import { Orthogonal } from '../../jscaip/direction/Orthogonal';
import { Vector } from '../../jscaip/Vector';
import { TriangularCheckerBoard } from '../../jscaip/state/TriangularCheckerBoard';

import { GoGroupData } from './GoGroupsData';
import { GoPiece } from './GoPiece';

export abstract class GoGroupDataFactory extends GroupDataFactory<GoPiece, GoGroupData> {

    public getNewInstance(color: GoPiece): GoGroupData {
        return new GoGroupData(color, [], [], [], [], [], []);
    }

}

export class OrthogonalGoGroupDataFactory extends GoGroupDataFactory {

    public constructor(public readonly zoom: number) {
        super();
    }

    public getDirections(_: Coord): ReadonlyArray<Vector> {
        return Orthogonal.ORTHOGONALS.map((value: Orthogonal) => new Vector(0, 0).combine(value, this.zoom));
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
