import { AbstractGoHeuristic } from '@everyboard/games/zoomed-go';
import { RectangularGoConfig } from '@everyboard/games/zoomed-go';
import { ZoomedGoRules } from '@everyboard/games/zoomed-go';

export class ZoomedGoHeuristic extends AbstractGoHeuristic<RectangularGoConfig> {

    public constructor() {
        super(ZoomedGoRules.get());
    }

}
