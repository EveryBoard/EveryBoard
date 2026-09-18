import { MGPMap } from '@everyboard/lib';

import { Direction } from '../Direction';

import { HexagonalTopology } from './HexagonalTopology';
import { SquareTopology } from './SquareTopology';
import { Topology } from './Topology';
import { TriangularTopology } from './TriangularTopology';

export type TopologyID = 'SQUARE' | 'HEXAGONAL' | 'TRIANGULAR';

export const topologyMap: MGPMap<TopologyID, Topology<Direction>> = new MGPMap<TopologyID, Topology<Direction>>([
    { key: 'SQUARE', value: new SquareTopology() },
    { key: 'HEXAGONAL', value: new HexagonalTopology() },
    { key: 'TRIANGULAR', value: new TriangularTopology() },
]);
