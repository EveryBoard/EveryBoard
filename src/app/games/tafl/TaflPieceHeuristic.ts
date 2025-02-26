import { TaflNode, TaflRules } from './TaflRules';
import { TaflMove } from './TaflMove';
import { TaflState } from './TaflState';
import { Player } from 'src/app/jscaip/Player';
import { HeuristicBounds, PlayerMetricHeuristicWithBounds } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { TaflConfig } from './TaflConfig';
import { MGPOptional } from '@everyboard/lib';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

export class TaflPieceHeuristic<M extends TaflMove> extends PlayerMetricHeuristicWithBounds<M, TaflState, TaflConfig> {

    public constructor(public readonly rules: TaflRules<M>) {
        super();
    }

    public override getMetrics(node: TaflNode<M>, config: MGPOptional<TaflConfig>): PlayerNumberTable {
        const state: TaflState = node.gameState;
        // We just count the pawns
        const zeroPawnsCount: number = this.rules.getPlayerListPawns(Player.ZERO, state).length;
        const onePawnsCount: number = this.rules.getPlayerListPawns(Player.ONE, state).length;
        return this.getHeuristicValue(config.get(), zeroPawnsCount, onePawnsCount).toTable();
    }

    private getHeuristicValue(config: TaflConfig, zeroPawnsCount: number, onePawnsCount: number): PlayerNumberMap {
        const invader: Player = this.rules.getInvader(config);
        const scoreZero: number = this.getScoreFor(Player.ZERO, invader, zeroPawnsCount);
        const scoreOne: number = this.getScoreFor(Player.ZERO, invader, onePawnsCount);
        return PlayerNumberMap.of(scoreZero, scoreOne);
    }

    private getScoreFor(player: Player, invader: Player, pawnsCount: number): number {
        // Invaders pieces are twice as numerous, so they are twice  less valuable
        let mult: number;
        if (player === Player.ZERO) {
            if (invader === Player.ZERO) {
                mult = 1;
            } else {
                mult = 2;
            }
        } else {
            if (invader === Player.ZERO) {
                mult = 2;
            } else {
                mult = 1;
            }
        }
        return pawnsCount * mult;
    }

    public override getBounds(config: MGPOptional<TaflConfig>): HeuristicBounds<BoardValue> {
        // For the maximum, we consider the game of hnefatafl which has 24 pieces and 13
        // Another option would be to define a heuristic that is mostly copy-pasted from this, but in each tafl games
        // In the end, what we care about is "bigger metric = better", not that it is 100% accurate
        const maxPawns: [number, number] = [24, 13];
        const invader: Player = this.rules.getInvader(config.get());
        const zeroPawnsCount: number = maxPawns[invader.getValue()];
        const onePawnsCount: number = maxPawns[invader.getOpponent().getValue()];
        const player0HeuristicValue: PlayerNumberMap = this.getHeuristicValue(config.get(), zeroPawnsCount, 0);
        const player0Best: BoardValue = BoardValue.ofPlayerNumberMap(player0HeuristicValue);
        const player1HeuristicValue: PlayerNumberMap = this.getHeuristicValue(config.get(), 0, onePawnsCount);
        const player1Best: BoardValue = BoardValue.ofPlayerNumberMap(player1HeuristicValue);
        return { player0Best, player1Best };
    }

}
