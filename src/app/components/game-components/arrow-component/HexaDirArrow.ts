import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Arrow } from './Arrow';

export class HexArrow extends Arrow<HexaDirection> {

    public override getAngle(dir: HexaDirection): number {
        return HexaDirection.getAngle(dir);
    }

}
