import { MGPMap } from '@everyboard/lib';

import { Direction } from '../Direction';

import { HexagonalTopology } from './HexagonalTopology';
import { OrdinalSquareTopology } from './OrdinalSquareTopology';
import { OrthogonalSquareTopology } from './OrthogonalSquareTopology';
import { Topology } from './Topology';
import { TriangularTopology } from './TriangularTopology';

export type TopologyID = 'SQUARE (4)' | 'SQUARE (8)' | 'HEXAGONAL' | 'TRIANGULAR';

export const topologyMap: MGPMap<TopologyID, Topology<Direction>> = new MGPMap<TopologyID, Topology<Direction>>([
    { key: 'SQUARE (4)', value: new OrthogonalSquareTopology() },
    { key: 'SQUARE (8)', value: new OrdinalSquareTopology() },
    { key: 'HEXAGONAL', value: new HexagonalTopology() },
    { key: 'TRIANGULAR', value: new TriangularTopology() },
]);
