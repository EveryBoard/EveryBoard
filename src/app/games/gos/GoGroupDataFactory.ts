import { GroupDataFactory } from '../../../app/jscaip/BoardData';
import { Orthogonal } from '../../../app/jscaip/Orthogonal';
import { GoGroupData } from './GoGroupsData';
import { GoPiece } from './GoPiece';
import { Coord } from '../../../app/jscaip/Coord';
import { TriangularCheckerBoard } from '../../../app/jscaip/state/TriangularCheckerBoard';

export abstract class GoGroupDatasFactory extends GroupDataFactory<GoPiece> {

    public getNewInstance(color: GoPiece): GoGroupData {
        return new GoGroupData(color, [], [], [], [], [], []);
    }

}

export class OrthogonalGoGroupDataFactory extends GoGroupDatasFactory {

    public getDirections(_: Coord): ReadonlyArray<Orthogonal> {
        return Orthogonal.ORTHOGONALS;
    }

}

export class TriangularGoGroupDataFactory extends GoGroupDatasFactory {

    public getDirections(coord: Coord): ReadonlyArray<Orthogonal> {
        return TriangularCheckerBoard.getDirections(coord);
    }

}
