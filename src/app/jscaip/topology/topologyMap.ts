import { MGPMap } from '@everyboard/lib';

import { HexagonalTopology } from './HexagonalTopology';
import { SquareTopology } from './SquareTopology';
import { Topology } from './Topology';
import { TriangularTopology } from './TriangularTopology';

export type TopologyID = 'SQUARE' | 'HEXAGONAL' | 'TRIANGULAR';

export const topologyMap: MGPMap<TopologyID, Topology> = new MGPMap([
    { key: 'SQUARE', value: new SquareTopology() },
    { key: 'HEXAGONAL', value: new HexagonalTopology() },
    { key: 'TRIANGULAR', value: new TriangularTopology() },
]);
