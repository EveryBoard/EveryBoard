import { Set } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { Direction } from '../../../jscaip/Direction';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Player } from '../../../jscaip/Player';
import { PlayerOrNone } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { TopologicShape } from '../../../jscaip/shape/Shape';
import { SimpleGameStateWithTable } from '../../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameStateWithTable } from '../../../jscaip/state/TopologicGameStateWithTable';
import { Topology } from '../../../jscaip/topology/Topology';

export class ReversiState extends TopologicGameStateWithTable<FourStatePiece> {

    public constructor(
        topology: Topology<Direction>,
        shape: TopologicShape<Direction>,
        gameStateWithTable: SimpleGameStateWithTable<FourStatePiece>,
    ) {
        super(topology, shape, gameStateWithTable);
    }

    public getNeighboringPawnLike(searchedValue: Player, center: Coord): Set<Coord> {
        const result: Coord[] = [];
        for (const coord of this.getTopology().getNeighbors(center)) {
            if (this.getPieceAt(coord).is(searchedValue)) {
                result.push(coord);
            }
        }
        return new Set(result);
    }

    public countScore(): PlayerNumberMap {
        const scores: PlayerNumberMap = PlayerNumberMap.of(0, 0);
        for (const coord of this.getAllCoords()) {
            const spaceOwner: PlayerOrNone = this.getPieceAt(coord).getPlayer();
            if (spaceOwner instanceof Player) {
                scores.add(spaceOwner, 1);
            }
        }
        return scores;
    }

}
