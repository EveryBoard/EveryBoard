import { GamePartSlice } from './GamePartSlice';
import { LegalityStatus } from './LegalityStatus';
import { Minimax } from './Minimax';
import { Move } from './Move';
import { NodeUnheritance } from './NodeUnheritance';

export abstract class AIManager<T> {

    constructor(public readonly firstAI: Minimax<Move, GamePartSlice, LegalityStatus, NodeUnheritance>,
                private firstValue: T,
                public readonly secondAI: Minimax<Move, GamePartSlice, LegalityStatus, NodeUnheritance>,
                private secondValue: T)
    {
    }
}
// TODO: remove
