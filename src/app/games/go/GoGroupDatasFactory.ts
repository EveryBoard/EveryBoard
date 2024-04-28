import { GroupDatasFactory } from 'src/app/jscaip/BoardDatas';
import { Orthogonal } from 'src/app/jscaip/Orthogonal';
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { GoGroupDatas } from './GoGroupsDatas';
import { GoPiece } from './GoState';

export class GoGroupDatasFactory extends GroupDatasFactory<GoPiece> {

    public getNewInstance(color: GoPiece): GoGroupDatas {
        return new GoGroupDatas(color, [], [], [], [], []);
    }
    public getDirections(): ReadonlyArray<Ordinal> {
        return Orthogonal.ORTHOGONALS as unknown as ReadonlyArray<Ordinal>;
    }
}
