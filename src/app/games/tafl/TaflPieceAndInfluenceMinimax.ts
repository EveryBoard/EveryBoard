import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { SandwichThreat } from '../../jscaip/PieceThreat';
import { TaflPawn } from './TaflPawn';
import { TaflMinimax, TaflNode } from './TaflMinimax';
import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';

export class TaflPieceAndInfluenceMinimax extends TaflMinimax {

    public width: number;

    public maxInfluence: number;

    public scoreByThreatenedPiece: number;

    public scoreBySafePiece: number;

    public constructor(ruler: TaflRules<TaflMove, TaflState>, name: string) {
        super(ruler, name);
        this.width = this.ruler.config.WIDTH;
        this.maxInfluence = 16 * ((this.width * 2) - 2);
        this.scoreByThreatenedPiece = (16 * this.maxInfluence) + 1;
        this.scoreBySafePiece = (16 * this.scoreByThreatenedPiece) + 1;
    }
    public getBoardValue(node: TaflNode): NodeUnheritance {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        const state: TaflState = node.gameState;
        const EMPTY: TaflPawn = TaflPawn.UNOCCUPIED;

        let score: number = 0;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        for (const owner of [Player.ZERO, Player.ONE]) {
            for (const coord of pieceMap.get(owner).get().getCopy()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    score += owner.getScoreModifier() * this.scoreByThreatenedPiece;
                } else {
                    score += owner.getScoreModifier() * this.scoreBySafePiece;
                    let influence: number = 0;
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (testedCoord.isInRange(this.width, this.width) &&
                               state.getPieceAt(testedCoord) === EMPTY)
                        {
                            influence++;
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                    score += influence * owner.getScoreModifier();
                }
            }
        }
        return new NodeUnheritance(score);
    }
    public getPiecesMap(state: TaflState): MGPMap<Player, MGPSet<Coord>> {
        const EMPTY: TaflPawn = TaflPawn.UNOCCUPIED;
        const map: MGPMap<Player, MGPSet<Coord>> = new MGPMap();
        const zeroPieces: Coord[] = [];
        const onePieces: Coord[] = [];
        for (let y: number = 0; y < this.width; y++) {
            for (let x: number = 0; x < this.width; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: TaflPawn = state.getPieceAt(coord);
                if (piece !== EMPTY) {
                    const owner: Player = state.getAbsoluteOwner(coord);
                    if (owner === Player.ZERO) {
                        zeroPieces.push(coord);
                    } else {
                        onePieces.push(coord);
                    }
                }
            }
        }
        map.set(Player.ZERO, new MGPSet(zeroPieces));
        map.set(Player.ONE, new MGPSet(onePieces));
        return map;
    }
    public getThreatMap(state: TaflState,
                        pieces: MGPMap<Player, MGPSet<Coord>>)
    : MGPMap<Coord, MGPSet<SandwichThreat>>
    {
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = new MGPMap();
        for (const player of [Player.ZERO, Player.ONE]) {
            for (const piece of pieces.get(player).get().getCopy()) {
                const threats: SandwichThreat[] = this.getThreats(piece, state);
                if (this.isThreatReal(piece, state, threats)) {
                    threatMap.set(piece, new MGPSet(threats));
                }
            }
        }
        return threatMap;
    }
    public getThreats(coord: Coord, state: TaflState): SandwichThreat[] {
        const threatenerPlayer: Player = state.getAbsoluteOwner(coord).getOpponent();
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
                    while (futureCapturer.isInRange(this.width, this.width) &&
                           state.getPieceAt(futureCapturer) === TaflPawn.UNOCCUPIED)
                    {
                        futureCapturer = futureCapturer.getNext(captureDirection);
                    }
                    if (futureCapturer.isInRange(this.width, this.width) &&
                        state.getAbsoluteOwner(futureCapturer) === threatenerPlayer &&
                        coord.getNext(dir, 1).equals(futureCapturer) === false)
                    {
                        movingThreats.push(futureCapturer);
                    }
                }
                threats.push(new SandwichThreat(directThreat, new MGPSet(movingThreats)));
            }
        }
        return threats;
    }
    public isAThreat(coord: Coord, state: TaflState, opponent: Player): boolean {
        if (coord.isNotInRange(this.width, this.width)) {
            return false;
        }
        if (state.getAbsoluteOwner(coord) === opponent) {
            return true;
        }
        if (this.ruler.isThrone(state, coord)) {
            if (opponent === Player.ONE) { // Defender
                return true;
            } else {
                return state.getPieceAt(coord) === TaflPawn.UNOCCUPIED;
            }
        }
        return false;
    }
    public isThreatReal(coord: Coord, state: TaflState, threats: SandwichThreat[]): boolean {
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
    public filterThreatMap(threatMap: MGPMap<Coord, MGPSet<SandwichThreat>>,
                           state: TaflState)
    : MGPMap<Coord, MGPSet<SandwichThreat>>
    {
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = new MGPMap();
        const threateneds: Coord[] = threatMap.listKeys();
        const threatenedPlayerPieces: Coord[] = threateneds.filter((coord: Coord) => {
            return state.getAbsoluteOwner(coord) === state.getCurrentPlayer();
        });
        const threatenedOpponentPieces: MGPSet<Coord> = new MGPSet(threateneds.filter((coord: Coord) => {
            return state.getAbsoluteOwner(coord) === state.getCurrentOpponent();
        }));
        for (const threatenedPiece of threatenedPlayerPieces) {
            const oldThreatSet: SandwichThreat[] = threatMap.get(threatenedPiece).get().getCopy();
            const newThreatSet: SandwichThreat[] = [];
            for (const threat of oldThreatSet) {
                if (threatenedOpponentPieces.contains(threat.direct.get(0)) === false) {
                    // if the direct threat of this piece is not a false threat
                    const newMover: Coord[] = [];
                    for (const mover of threat.mover.getCopy()) {
                        if (threatenedOpponentPieces.contains(mover) === false) {
                            // if the moving threat of this piece is real
                            newMover.push(mover);
                        }
                    }
                    if (newMover.length > 0) {
                        newThreatSet.push(new SandwichThreat(threat.direct.get(0), new MGPSet(newMover)));
                    }
                }
            }
            if (newThreatSet.length > 0) {
                filteredThreatMap.set(threatenedPiece, new MGPSet(newThreatSet));
            }
        }
        for (const threatenedOpponentPiece of threatenedOpponentPieces.getCopy()) {
            const threatSet: MGPSet<SandwichThreat> = threatMap.get(threatenedOpponentPiece).get();
            filteredThreatMap.set(threatenedOpponentPiece, threatSet);
        }
        return filteredThreatMap;
    }
}
