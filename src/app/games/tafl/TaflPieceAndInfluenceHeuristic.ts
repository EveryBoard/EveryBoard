import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { SandwichThreat } from '../../jscaip/PieceThreat';
import { TaflPawn } from './TaflPawn';
import { TaflNode } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { TaflPieceHeuristic } from './TaflPieceHeuristic';
import { Utils } from 'src/app/utils/utils';

export type PointValue = {
    width: number;
    maxInfluence: number;
    scoreByThreatenedPiece: number;
    scoreBySafePiece: number;
}

export class TaflPieceAndInfluenceHeuristic<M extends TaflMove> extends TaflPieceHeuristic<M> {

    public getPointValue(node: TaflNode<M>): PointValue {
        // eslint-disable-next-line dot-notation
        const initialState: TaflState = this.rules.getInitialState(node.config);
        const width: number = initialState.board.length;
        const maxInfluence: number = 16 * ((width * 2) - 2);
        const scoreByThreatenedPiece: number = (16 * maxInfluence) + 1;
        const scoreBySafePiece: number = (16 * scoreByThreatenedPiece) + 1;
        return {
            width,
            maxInfluence,
            scoreByThreatenedPiece,
            scoreBySafePiece,
        };
    }

    public override getBoardValue(node: TaflNode<M>): BoardValue {
        const gameStatus: GameStatus = this.rules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        }
        const pointValue: PointValue = this.getPointValue(node);
        const state: TaflState = node.gameState;
        const empty: TaflPawn = TaflPawn.UNOCCUPIED;

        let score: number = 0;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.getThreatMap(node, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        for (const owner of Player.PLAYERS) {
            for (const coord of pieceMap.get(owner).get()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    score += owner.getScoreModifier() * pointValue.scoreByThreatenedPiece;
                } else {
                    score += owner.getScoreModifier() * pointValue.scoreBySafePiece;
                    let influence: number = 0;
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (state.isOnBoard(testedCoord) && state.getPieceAt(testedCoord) === empty) {
                            influence++;
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                    score += influence * owner.getScoreModifier();
                }
            }
        }
        return new BoardValue(score);
    }

    public getPiecesMap(state: TaflState): MGPMap<Player, MGPSet<Coord>> {
        const empty: TaflPawn = TaflPawn.UNOCCUPIED;
        const zeroPieces: Coord[] = [];
        const onePieces: Coord[] = [];
        for (let y: number = 0; y < state.board.length; y++) {
            for (let x: number = 0; x < state.board[0].length; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: TaflPawn = state.getPieceAt(coord);
                if (piece !== empty) {
                    const owner: PlayerOrNone = state.getAbsoluteOwner(coord);
                    if (owner === Player.ZERO) {
                        zeroPieces.push(coord);
                    } else {
                        onePieces.push(coord);
                    }
                }
            }
        }
        const map: MGPMap<Player, MGPSet<Coord>> = new MGPMap([
            { key: Player.ZERO, value: new CoordSet(zeroPieces) },
            { key: Player.ONE, value: new CoordSet(onePieces) },
        ]);
        return map;
    }

    public getThreatMap(node: TaflNode<M>, pieces: MGPMap<Player, MGPSet<Coord>>)
    : MGPMap<Coord, MGPSet<SandwichThreat>>
    {
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = new MGPMap();
        for (const player of Player.PLAYERS) {
            for (const piece of pieces.get(player).get()) {
                const threats: SandwichThreat[] = this.getThreats(piece, node.gameState);
                if (this.isThreatReal(piece, node.gameState, threats)) {
                    threatMap.set(piece, new MGPSet(threats));
                }
            }
        }
        return threatMap;
    }

    private getThreats(coord: Coord, state: TaflState): SandwichThreat[] {
        const owner: PlayerOrNone = state.getAbsoluteOwner(coord);
        Utils.assert(owner.isPlayer(), 'TaflPieceAndInfluenceMinimax.getThreats should be called with an occupied coordinate');
        const threatenerPlayer: Player = (owner as Player).getOpponent();
        const threats: SandwichThreat[] = [];
        for (const dir of Orthogonal.ORTHOGONALS) {
            const directThreat: Coord = coord.getPrevious(dir, 1);
            if (this.isAThreat(directThreat, state, threatenerPlayer)) {
                const movingThreats: Coord[] = [];
                for (const captureDirection of Orthogonal.ORTHOGONALS) {
                    if (captureDirection === dir.getOpposite()) {
                        continue;
                    }
                    let futureCapturer: Coord = coord.getNext(dir, 1);
                    while (state.isOnBoard(futureCapturer) &&
                           state.getPieceAt(futureCapturer) === TaflPawn.UNOCCUPIED)
                    {
                        futureCapturer = futureCapturer.getNext(captureDirection);
                    }
                    if (state.isOnBoard(futureCapturer) &&
                        state.getAbsoluteOwner(futureCapturer) === threatenerPlayer &&
                        coord.getNext(dir, 1).equals(futureCapturer) === false)
                    {
                        movingThreats.push(futureCapturer);
                    }
                }
                threats.push(new SandwichThreat(directThreat, new CoordSet(movingThreats)));
            }
        }
        return threats;
    }

    protected isAThreat(coord: Coord, state: TaflState, opponent: Player): boolean {
        if (state.isOnBoard(coord) === false) {
            return false;
        }
        if (state.getAbsoluteOwner(coord) === opponent) {
            return true;
        }
        if (this.rules.isThrone(state, coord)) {
            if (opponent === Player.ONE) { // Defender
                return true;
            } else {
                return state.getPieceAt(coord) === TaflPawn.UNOCCUPIED;
            }
        }
        return false;
    }

    protected isThreatReal(coord: Coord, state: TaflState, threats: SandwichThreat[]): boolean {
        if (threats.length === 0) {
            return false;
        }
        if (state.getPieceAt(coord).isKing()) {
            return threats.length === 3;
        } else {
            for (const threat of threats) {
                if (threat.mover.size() > 0) {
                    return true;
                }
            }
            return false;
        }
    }

    public filterThreatMap(threatMap: MGPMap<Coord, MGPSet<SandwichThreat>>, state: TaflState)
    : MGPMap<Coord, MGPSet<SandwichThreat>>
    {
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = new MGPMap();
        const threateneds: Coord[] = threatMap.listKeys();
        const threatenedPlayerPieces: Coord[] = threateneds.filter((coord: Coord) => {
            return state.getAbsoluteOwner(coord) === state.getCurrentPlayer();
        });
        const threatenedOpponentPieces: MGPSet<Coord> = new CoordSet(threateneds.filter((coord: Coord) => {
            return state.getAbsoluteOwner(coord) === state.getCurrentOpponent();
        }));
        for (const threatenedPiece of threatenedPlayerPieces) {
            const oldThreatSet: MGPSet<SandwichThreat> = threatMap.get(threatenedPiece).get();
            const newThreatSet: SandwichThreat[] = [];
            for (const threat of oldThreatSet) {
                if (threatenedOpponentPieces.contains(threat.directThreat) === false) {
                    // if the direct threat of this piece is not a false threat
                    const newMover: Coord[] = [];
                    for (const mover of threat.mover) {
                        if (threatenedOpponentPieces.contains(mover) === false) {
                            // if the moving threat of this piece is real
                            newMover.push(mover);
                        }
                    }
                    if (newMover.length > 0) {
                        newThreatSet.push(new SandwichThreat(threat.directThreat, new CoordSet(newMover)));
                    }
                }
            }
            if (newThreatSet.length > 0) {
                filteredThreatMap.set(threatenedPiece, new MGPSet(newThreatSet));
            }
        }
        for (const threatenedOpponentPiece of threatenedOpponentPieces) {
            const threatSet: MGPSet<SandwichThreat> = threatMap.get(threatenedOpponentPiece).get();
            filteredThreatMap.set(threatenedOpponentPiece, threatSet);
        }
        return filteredThreatMap;
    }

}
