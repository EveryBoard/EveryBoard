import { AbstractGoHeuristic } from '@everyboard/games/gos';
import { RectangularGoConfig } from '@everyboard/games/gos/abstract-rectangular-go';
import { ZoomedGoRules } from '@everyboard/games/gos/zoomed-go';

export class ZoomedGoHeuristic extends AbstractGoHeuristic<RectangularGoConfig> {

    public constructor() {
        super(ZoomedGoRules.get());
    }

}
