import { GroupDatasFactory } from 'src/app/jscaip/BoardDatas';
import { Direction, Orthogonal } from 'src/app/jscaip/Direction';
import { GoGroupDatas } from './GoGroupsDatas';
import { GoPiece } from './GoState';

export class GoGroupDatasFactory extends GroupDatasFactory<GoPiece> {

    public getNewInstance(color: GoPiece): GoGroupDatas {
        return new GoGroupDatas(color, [], [], [], [], []);
    }
    public getDirections(): ReadonlyArray<Direction> {
        return Orthogonal.ORTHOGONALS as ReadonlyArray<Direction>;
    }
}
