import { MGPMap, Utils, ArrayUtils } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { BoardData, GroupData, GroupDataFactory, GroupInfos } from '../../jscaip/BoardData';
import { Coord } from '../../jscaip/Coord';
import { CoordSet } from '../../jscaip/CoordSet';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Orthogonal } from '../../jscaip/Orthogonal';
import { PlayerOrNone } from '../../jscaip/Player';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { NoConfig } from '../../jscaip/RulesConfigUtil';
import { TableUtils } from '../../jscaip/TableUtils';
import { TriangularCheckerBoard } from '../../jscaip/state/TriangularCheckerBoard';

import { SaharaMove } from './SaharaMove';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';


class FourStateGroupData extends GroupData<FourStatePiece> {
    public constructor(color: FourStatePiece,
                       public emptyCoords: Coord[],
                       public darkCoords: Coord[],
                       public lightCoords: Coord[],
                       public unreachableCoords: Coord[])
    {
        super(color);
    }

    public getCoords(): Coord[] {
        if (this.color === FourStatePiece.ZERO) {
            return this.darkCoords;
        } else if (this.color === FourStatePiece.ONE) {
            return this.lightCoords;
        } else if (this.color.equals(FourStatePiece.EMPTY)) {
            return this.emptyCoords;
        } else {
            return this.unreachableCoords;
        }
    }

    public contains(coord: Coord): boolean {
        const allCoords: Coord[] = this.darkCoords
            .concat(this.lightCoords)
            .concat(this.emptyCoords)
            .concat(this.unreachableCoords);
        return allCoords.some((c: Coord) => c.equals(coord));
    }

    public addPawn(coord: Coord, color: FourStatePiece): void {
        Utils.assert(this.contains(coord) === false, 'This group already contains ' + coord.toString());

        switch (color) {
            case FourStatePiece.ZERO:
                this.darkCoords = GroupData.insert(this.darkCoords, coord);
                break;
            case FourStatePiece.ONE:
                this.lightCoords = GroupData.insert(this.lightCoords, coord);
                break;
            case FourStatePiece.UNREACHABLE:
                this.unreachableCoords = GroupData.insert(this.unreachableCoords, coord);
                break;
            default:
                Utils.expectToBe(color, FourStatePiece.EMPTY);
                this.emptyCoords = GroupData.insert(this.emptyCoords, coord);
        }
    }

    public override isMonoWrapped(): boolean {
        return this.darkCoords.length + this.lightCoords.length === 1;
    }

    public getWrapper(): FourStatePiece {
        const wrapperSizes: MGPMap<FourStatePiece, number> = new MGPMap();
        wrapperSizes.set(FourStatePiece.EMPTY, this.emptyCoords.length);
        wrapperSizes.set(FourStatePiece.ZERO, this.darkCoords.length);
        wrapperSizes.set(FourStatePiece.ONE, this.lightCoords.length);
        const nonEmptyWrapper: MGPMap<FourStatePiece, number> =
            wrapperSizes.filter((_key: FourStatePiece, value: number) => value > 0);
        Utils.assert(nonEmptyWrapper.size() === 1,
                     `Can't call getWrapper on non-mono-wrapped group`);
        return nonEmptyWrapper.getAnyPair().get().key;
    }

    public override getNeighbors(): Coord[] {
        const neighbors: Coord[] = [];
        if (this.color !== FourStatePiece.EMPTY) {
            neighbors.push(...this.emptyCoords);
        }
        if (this.color !== FourStatePiece.ZERO) {
            neighbors.push(...this.darkCoords);
        }
        if (this.color !== FourStatePiece.ONE) {
            neighbors.push(...this.lightCoords);
        }
        return neighbors;
    }

    public override getNeighborsEntryPoints(): Coord[] {
        const neighborsEntryPoints: Coord[] = [];
        if (this.color !== FourStatePiece.EMPTY && this.emptyCoords.length > 0) {
            neighborsEntryPoints.push(this.emptyCoords[0]);
        }
        if (this.color !== FourStatePiece.ZERO && this.darkCoords.length > 0) {
            neighborsEntryPoints.push(this.darkCoords[0]);
        }
        if (this.color !== FourStatePiece.ONE && this.lightCoords.length > 0) {
            neighborsEntryPoints.push(this.lightCoords[0]);
        }
        return neighborsEntryPoints;
    }

}

class FourStatePieceGroupDataFactory extends GroupDataFactory<FourStatePiece, FourStateGroupData> {

    public getNewInstance(color: FourStatePiece): FourStateGroupData {
        return new FourStateGroupData(color, [], [], [], []);
    }

    public getDirections(coord: Coord): ReadonlyArray<Orthogonal> {
        return TriangularCheckerBoard.getDirections(coord);
    }

}

export class SaharaTerritoryHeuristic extends PlayerMetricHeuristic<SaharaMove, SaharaState> {
    // TODO for review: just fun fact that this complex poop I think does the same as Captured > Captured's Freedom > Freedom
    // Mais avec du code plus complexe qui prend blindé de temps pour rien mdr :D sang de bite :D
    // Let this shit not reach prod hahah

    public readonly groupDataFactory: GroupDataFactory<FourStatePiece, FourStateGroupData> =
        new FourStatePieceGroupDataFactory();

    public override getMetrics(node: SaharaNode, _config: NoConfig): PlayerNumberTable {
        const deadPieces: MGPMap<PlayerOrNone, CoordSet> = this.getDeadPieces(node.gameState);
        const zeroDeadPieces: number = deadPieces.get(Player.ZERO).get().size();
        const oneDeadPieces: number = deadPieces.get(Player.ONE).get().size();
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(node.gameState, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(node.gameState, Player.ONE);
        return PlayerNumberTable.of(
            [zeroDeadPieces, ...zeroFreedoms],
            [oneDeadPieces, ...oneFreedoms],
        );
    }

    private getDeadPieces(state: SaharaState): MGPMap<PlayerOrNone, CoordSet> {
        const mapCoordToAliveness: MGPMap<PlayerOrNone, CoordSet> = new MGPMap();
        mapCoordToAliveness.set(Player.ZERO, new CoordSet());
        mapCoordToAliveness.set(Player.ONE, new CoordSet());
        const boardData: BoardData = BoardData.ofBoard(state.getCopiedBoard(), this.groupDataFactory);
        TableUtils.forEach(boardData.groupIndices, (coord: Coord, _: number) => {
            const group: FourStatePiece = state.getPieceAt(coord);
            if (group.isPlayer()) {
                if (this.isSurrounded(state, coord, boardData)) {
                    const playerSet: CoordSet = mapCoordToAliveness.get(group.getPlayer()).get();
                    mapCoordToAliveness.put(group.getPlayer(), playerSet.addElement(coord));
                }
            }
        });
        return mapCoordToAliveness;
    }

    public isSurrounded(state: SaharaState, coord: Coord, boardData: BoardData): boolean {
        const group: FourStatePiece = state.getPieceAt(coord);
        const listOfEmptyNeighbor: readonly Coord[] = TriangularCheckerBoard
            .getNeighbors(coord)
            .filter((c: Coord) => state.hasPieceAt(c, FourStatePiece.EMPTY));
        const listOfEmptyNeighborThatLeadToAlly: Coord[] = listOfEmptyNeighbor
            .filter((neighboringEmptySpace: Coord) => {
                const neighboringEmptyGroup: number =
                    boardData.groupIndices[neighboringEmptySpace.y][neighboringEmptySpace.x];
                const neighboringEmptyGroupData: GroupInfos = boardData.groups[neighboringEmptyGroup];
                const listOfNeighborsGroupsOfThatEmptySpace: readonly number[] =
                    neighboringEmptyGroupData.neighboringGroups.toList();
                const listOfNeighborsOfThatEmptySpaceEntryCoord: readonly Coord[] =
                    listOfNeighborsGroupsOfThatEmptySpace.map(
                        (groupIndex: number) => boardData.groups[groupIndex].coords[0],
                    );
                const countOfAlliedNeighborsOfThatEmptySpace: number =
                    ArrayUtils.countByPredicate(
                        listOfNeighborsOfThatEmptySpaceEntryCoord,
                        (neighborsOfThatEmptySpace: Coord ) => {
                            return state.hasPieceAt(neighborsOfThatEmptySpace, group);
                        },
                    );
                return countOfAlliedNeighborsOfThatEmptySpace > 1;
            });
        return listOfEmptyNeighborThatLeadToAlly.length === 0;
    }

}
