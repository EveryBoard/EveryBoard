import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Player } from 'src/app/jscaip/player/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { SixGameState } from '../six-game-state/SixGameState';
import { SixMove } from '../six-move/SixMove';
import { SixLegalityStatus } from '../SixLegalityStatus';

export class SixNode extends MGPNode<SixRules, SixMove, SixGameState, SixLegalityStatus> {}

export class SixRules extends Rules<SixMove, SixGameState, SixLegalityStatus> {
    public getListMoves(node: SixNode): MGPMap<SixMove, SixGameState> {
        throw new Error('Method not implemented.');
    }
    public getBoardValue(move: SixMove, slice: SixGameState): number {
        let lastDrop: Coord;
        if (move.landing.isPresent()) {
            lastDrop = move.landing.get();
        } else {
            lastDrop = move.coord;
        }
        const victoryValue: number = slice.getCurrentPlayer().getVictoryValue();
        if (this.isLineVictory(lastDrop, slice)) {
            return victoryValue;
        }
        if (this.isCircleVictory(lastDrop, slice)) {
            return victoryValue;
        }
        return 0;
    }
    public isLineVictory(lastDrop: Coord, state: SixGameState): boolean {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        const alignedByDirection: MGPMap<HexaDirection, number> = new MGPMap<HexaDirection, number>();
        alignedByDirection.set(HexaDirection.UP, 1);
        alignedByDirection.set(HexaDirection.UP_RIGHT, 1);
        alignedByDirection.set(HexaDirection.UP_LEFT, 1);
        for (const dir of HexaDirection.factory.all) {
            let testedCoords: number = 0;
            let noStop: boolean = true;
            let testCoord: Coord = lastDrop.getNext(dir, 1);
            while (testedCoords < 6 && noStop) {
                if (state.getPieceAt(testCoord) === LAST_PLAYER) {
                    const aligned: number = this.incrementForDirection(alignedByDirection, dir);
                    if (aligned === 6) {
                        return true;
                    }
                    testedCoords++;
                    testCoord = testCoord.getNext(dir, 1);
                } else {
                    noStop = false;
                }
            }
        }
        return false;
    }
    private incrementForDirection(alignedByDirection: MGPMap<HexaDirection, number>, dir: HexaDirection): number {
        let key: HexaDirection;
        if (alignedByDirection.containsKey(dir)) {
            key = dir;
        } else {
            key = dir.getOpposite();
        }
        const aligned: number = alignedByDirection.get(key).get() + 1;
        alignedByDirection.replace(key, aligned);
        return aligned;
    }
    public isCircleVictory(lastDrop: Coord, state: SixGameState): boolean {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        for (let i: number = 0; i < 6; i++) {
            const initialDirection: HexaDirection = HexaDirection.factory.all[i];
            let testedCoords: number = 0;
            let noStop: boolean = true;
            let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
            while (testedCoords < 5 && noStop) {
                if (state.getPieceAt(testCoord) === LAST_PLAYER) {
                    testedCoords++;
                    const dirIndex: number = (testedCoords + i) % 6;
                    const dir: HexaDirection = HexaDirection.factory.all[dirIndex];
                    testCoord = testCoord.getNext(dir, 1);
                } else {
                    noStop = false;
                }
            }
            if (testedCoords === 5 && noStop) {
                return true;
            }
        }
        return false;
    }
    public applyLegalMove(move: SixMove,
                          state: SixGameState,
                          status: SixLegalityStatus): { resultingMove: SixMove; resultingSlice: SixGameState; }
    {
        if (state.turn < 40) {
            return { resultingSlice: state.applyLegalDrop(move.coord), resultingMove: move };
        } else {
            const kept: MGPSet<Coord> = status.kept;
            return { resultingSlice: state.applyLegalDeplacement(move, kept), resultingMove: move };
        }
    }
    public isLegal(move: SixMove, slice: SixGameState): SixLegalityStatus {
        if (slice.turn < 40) {
            return this.isLegalDrop(move, slice);
        } else {
            return this.isLegalDeplacement(move, slice);
        }
    }
    public isLegalDrop(move: SixMove, slice: SixGameState): SixLegalityStatus {
        if (move.landing.isPresent() || move.keep.isPresent()) {
            return { legal: MGPValidation.failure('Cannot do deplacement before 42th turn!'), kept: null };
        }
        const landingLegality: MGPValidation = slice.isIllegalLandingZone(move.coord);
        if (landingLegality.isFailure()) {
            return { legal: landingLegality, kept: null };
        }
        return {
            legal: MGPValidation.SUCCESS,
            kept: slice.pieces.getKeySet(),
        };
    }
    public isLegalDeplacement(move: SixMove, state: SixGameState): SixLegalityStatus {
        const landing: Coord = move.landing.getOrNull();
        if (landing == null) {
            return { legal: MGPValidation.failure('Can no longer drop after 40th turn!'), kept: null };
        }
        switch (state.getPieceAt(move.coord)) {
            case Player.NONE:
                return { legal: MGPValidation.failure('Cannot move empty coord!'), kept: null };
            case state.getCurrentEnnemy():
                return { legal: MGPValidation.failure('Cannot move ennemy piece!'), kept: null };
        }
        const landingLegality: MGPValidation = state.isIllegalLandingZone(landing);
        if (landingLegality.isFailure()) {
            return { legal: landingLegality, kept: null };
        }
        const stateAfterDeplacement: SixGameState = state.deplacePiece(move);
        const groupsAfterMove: MGPSet<MGPSet<Coord>> = stateAfterDeplacement.getGroups(move.coord);
        if (this.isSplit(groupsAfterMove)) {
            const biggerGroups: MGPSet<MGPSet<Coord>> = this.getBiggerGroups(groupsAfterMove);
            if (biggerGroups.size() === 1) {
                if (move.keep.isPresent()) {
                    return {
                        legal: MGPValidation.failure('You cannot choose which part to keep when one is smaller than the other!'),
                        kept: null,
                    };
                } else {
                    return { legal: MGPValidation.SUCCESS, kept: biggerGroups.get(0) };
                }
            } else {
                return this.moveKeepBiggerGroup(move.keep, biggerGroups, stateAfterDeplacement);
            }
        } else {
            return {
                legal: MGPValidation.SUCCESS,
                kept: new MGPSet(),
            };
        }
    }
    public isSplit(groups: MGPSet<MGPSet<Coord>>): boolean {
        return groups.size() > 1;
    }
    public getBiggerGroups(groups: MGPSet<MGPSet<Coord>>): MGPSet<MGPSet<Coord>> {
        let biggerSize: number = 0;
        let biggerGroups: MGPSet<MGPSet<Coord>> = new MGPSet();
        for (let i: number = 0; i < groups.size(); i++) {
            const group: MGPSet<Coord> = groups.get(i);
            const groupSize: number = group.size();
            if (groupSize > biggerSize) {
                biggerSize = groupSize;
                biggerGroups = new MGPSet([group]);
            } else if (groupSize === biggerSize) {
                biggerGroups.add(group);
            }
        }
        return biggerGroups;
    }
    public moveKeepBiggerGroup(keep: MGPOptional<Coord>,
                               biggerGroups: MGPSet<MGPSet<Coord>>,
                               state: SixGameState): SixLegalityStatus {
        if (keep.isAbsent()) {
            return {
                legal: MGPValidation.failure('Several groups are of same size, you must pick the one to keep!'),
                kept: null,
            };
        }
        if (state.getPieceAt(keep.get()) === Player.NONE) {
            return { legal: MGPValidation.failure('Cannot keep empty coord!'), kept: null };
        }
        const keptCoord: Coord = keep.get();
        for (let i: number = 0; i < biggerGroups.size(); i++) {
            const subGroup: MGPSet<Coord> = biggerGroups.get(i);
            if (subGroup.contains(keptCoord)) {
                return { legal: MGPValidation.SUCCESS, kept: subGroup };
            }
        }
        return {
            legal: MGPValidation.failure('Should keep a piece belonging to one of the greater groups'),
            kept: null,
        };
    }
}
