import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { GobanConfig } from '../../../jscaip/GobanConfig';
import { GobanUtils } from '../../../jscaip/GobanUtils';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { AbstractGoConfig, AbstractGoRules } from '../AbstractGoRules';
import { GoGroupDataFactory, OrthogonalGoGroupDataFactory } from '../GoGroupDataFactory';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';

export type RectangularGoConfig =
    AbstractGoConfig &
    GobanConfig &
    {
        handicap: number;
        zoom: number;
    };

export abstract class AbstractRectangularGoRules extends AbstractGoRules<RectangularGoConfig> {

    public override getZoom(config: RectangularGoConfig): number {
        return config.zoom;
    }

    public override getInitialState(config: RectangularGoConfig): GoState {
        const board: GoPiece[][] = GoState.getStartingBoard(config.width, config.height);
        let turn: number = 0;
        const left: number = GobanUtils.getHorizontalLeft(config.width);
        const right: number = GobanUtils.getHorizontalRight(config.width);
        const up: number = GobanUtils.getVerticalUp(config.height);
        const down: number = GobanUtils.getVerticalDown(config.height);
        const horizontalCenter: number = GobanUtils.getHorizontalCenter(config.width);
        const verticalCenter: number = GobanUtils.getVerticalCenter(config.height);
        const orderedHandicaps: Coord[] = [
            new Coord(left, up),
            new Coord(right, down),
            new Coord(right, up),
            new Coord(left, down),
            new Coord(horizontalCenter, verticalCenter),
            new Coord(horizontalCenter, up),
            new Coord(horizontalCenter, down),
            new Coord(left, verticalCenter),
            new Coord(right, verticalCenter),
        ];
        if (1 <= config.handicap) {
            turn = 1;
        }
        for (let i: number = 0; i < config.handicap; i++) {
            const handicapToPut: Coord = orderedHandicaps[i];
            board[handicapToPut.y][handicapToPut.x] = GoPiece.DARK;
        }
        return new GoState(board, PlayerNumberMap.of(0, 0), turn, MGPOptional.empty(), GoPhase.PLAYING);
    }

    public override getGoGroupDataFactory(zoom: number): GoGroupDataFactory {
        return new OrthogonalGoGroupDataFactory(zoom);
    }

}
