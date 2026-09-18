import { GameStateWithTable } from './GameStateWithTable';

export class SimpleGameStateWithTable<P extends NonNullable<unknown>> extends GameStateWithTable<P> {

    public static of<P extends NonNullable<unknown>>(
        oldState: SimpleGameStateWithTable<P>,
        newBoard: P[][],
    ): SimpleGameStateWithTable<P> {
        return new SimpleGameStateWithTable(
            newBoard,
            oldState.turn,
        );
    }

    public incrementTurn(): this {
        return new SimpleGameStateWithTable(
            this.getCopiedBoard(),
            this.turn + 1,
        ) as this;
    }

}
