import { MGPMap } from '@everyboard/lib';

import { Direction } from '../direction/Direction';

import { EightDirectionSquareTopology } from './EightDirectionSquareTopology';
import { HexagonalTopology } from './HexagonalTopology';
import { OrthogonalSquareTopology } from './OrthogonalSquareTopology';
import { Topology } from './Topology';
import { TriangularTopology } from './TriangularTopology';

export type TopologyID = 'SQUARE (4)' | 'SQUARE (8)' | 'HEXAGON' | 'TRIANGLE';

export const topologyMap: MGPMap<TopologyID, Topology<Direction>> = new MGPMap<TopologyID, Topology<Direction>>([
    { key: 'SQUARE (4)', value: new OrthogonalSquareTopology() },
    { key: 'SQUARE (8)', value: new EightDirectionSquareTopology() },
    { key: 'HEXAGON', value: new HexagonalTopology() },
    { key: 'TRIANGLE', value: new TriangularTopology() },
    { key: 'SQUARE (8)', value: new EightDirectionSquareTopology() },
    { key: 'HEXAGON', value: new HexagonalTopology() },
    { key: 'TRIANGLE', value: new TriangularTopology() },
]);
