import { GroupDataFactory } from '../../jscaip/BoardData';
import { Coord } from '../../jscaip/Coord';
import { Orthogonal } from '../../jscaip/Orthogonal';
import { TriangularCheckerBoard } from '../../jscaip/state/TriangularCheckerBoard';

import { GoGroupData } from './GoGroupsData';
import { GoPiece } from './GoPiece';

export abstract class GoGroupDataFactory extends GroupDataFactory<GoPiece, GoGroupData> {

    public getNewInstance(color: GoPiece): GoGroupData {
        return new GoGroupData(color, [], [], [], [], [], []);
    }

}

export class OrthogonalGoGroupDataFactory extends GoGroupDataFactory {

    public getDirections(_: Coord): ReadonlyArray<Orthogonal> {
        return Orthogonal.ORTHOGONALS;
    }

}

export class TriangularGoGroupDataFactory extends GoGroupDataFactory {

    public getDirections(coord: Coord): ReadonlyArray<Orthogonal> {
        return TriangularCheckerBoard.getDirections(coord);
    }

}
