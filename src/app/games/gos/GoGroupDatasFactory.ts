import { GroupDatasFactory } from 'src/app/jscaip/BoardDatas';
import { Orthogonal } from 'src/app/jscaip/Orthogonal';
import { GoGroupDatas } from './GoGroupsDatas';
import { GoPiece } from './GoPiece';
import { Coord } from 'src/app/jscaip/Coord';
import { TriangularCheckerBoard } from 'src/app/jscaip/state/TriangularCheckerBoard';

export class OrthogonalGoGroupDatasFactory extends GroupDatasFactory<GoPiece> {

    public getNewInstance(color: GoPiece): GoGroupDatas {
        return new GoGroupDatas(color, [], [], [], [], []);
    }
    public getDirections(_: Coord): ReadonlyArray<Orthogonal> {
        return Orthogonal.ORTHOGONALS;
    }
}

export class TriangularGoGroupDatasFactory extends GroupDatasFactory<GoPiece> {

    public getNewInstance(color: GoPiece): GoGroupDatas {
        return new GoGroupDatas(color, [], [], [], [], []);
    }

    public getDirections(coord: Coord): ReadonlyArray<Orthogonal> {
        return TriangularCheckerBoard.getDirections(coord);
    }

}
