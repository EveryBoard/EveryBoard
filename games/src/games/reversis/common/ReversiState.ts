import { MGPOptional, Set } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Player } from '../../../jscaip/Player';
import { PlayerOrNone } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { Direction } from '../../../jscaip/direction/Direction';
import { TopologicShape } from '../../../jscaip/shape/TopologicShape';
import { SimpleGameStateWithTable } from '../../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameStateWithTable } from '../../../jscaip/state/TopologicGameStateWithTable';
import { Topology } from '../../../jscaip/topology/Topology';

export class ReversiState<D extends Direction> extends TopologicGameStateWithTable<FourStatePiece, D> {

    public constructor(
        topology: Topology<D>,
        shape: TopologicShape<D>,
        gameStateWithTable: SimpleGameStateWithTable<FourStatePiece>,
    ) {
        super(topology, shape, gameStateWithTable);
    }

    public getNeighboringPawnLike(searchedValue: Player, center: Coord): Set<Coord> {
        const result: Coord[] = [];
        for (const direction of this.getTopology().getDirections()) {
            const landingCoord: MGPOptional<Coord> = this.getShape().getNextCoord(center, direction, 1);
            // console.log('>>>>>', direction)
            // console.log(landingCoord)
            // console.log(landingCoord.isPresent() ? 'is present' : 'is absent')
            // if (landingCoord.isPresent()) {
                // console.log('is ', landingCoord.get(), ' on board ? ', this.isOnBoard(landingCoord.get()))
                // console.log('actually containing', this.getPieceAt(landingCoord.get()))
            // }
            if (landingCoord.isPresent() &&
                this.isOnBoard(landingCoord.get()) &&
                this.getPieceAt(landingCoord.get()).is(searchedValue)
            ) {
                result.push(landingCoord.get());
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
