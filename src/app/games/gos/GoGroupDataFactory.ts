import { GroupDataFactory } from '../../jscaip/BoardData';
import { Orthogonal } from '../../jscaip/Orthogonal';
import { GoGroupData } from './GoGroupsData';
import { GoPiece } from './GoPiece';
import { Coord } from '../../jscaip/Coord';
import { TriangularCheckerBoard } from '../../jscaip/state/TriangularCheckerBoard';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Direction } from 'src/app/jscaip/Direction';

export abstract class GoGroupDatasFactory extends GroupDataFactory<GoPiece> {

    public getNewInstance(color: GoPiece): GoGroupData {
        return new GoGroupData(color, [], [], [], [], [], []);
    }

}

export class OrthogonalGoGroupDataFactory extends GoGroupDatasFactory {

    public getDirections(_: Coord): ReadonlyArray<Direction> {
        return Orthogonal.ORTHOGONALS;
    }

}

export class TriangularGoGroupDataFactory extends GoGroupDatasFactory {

    public getDirections(coord: Coord): ReadonlyArray<Direction> {
        return TriangularCheckerBoard.getDirections(coord);
    }

}

export class HexagonalGoGroupDataFactory extends GoGroupDatasFactory {

    public getDirections(_: Coord): ReadonlyArray<Direction> {
        return HexaDirection.factory.all;
    }

}
