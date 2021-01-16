export interface IJoiner {

    candidatesNames: string[]; // TODO: give default empty value
    creator: string;
    chosenPlayer: string; // TODO: make optional
    firstPlayer: string;
    /* 0: the creator
     * 1: the chosenPlayer
     * 2: random
     */

    partStatus: number;
    /* 0 : part created, no chosenPlayer                                                               => waiting for acceptable candidate
     * 1 : part created, chosenPlayer selected, no config proposed                                     => waiting the creator to propose config
     * 2 : part created, chosenPlayer selected, config proposed by the creator                         => waiting the joiner to accept them
     * 3 : part created, chosenPlayer selected, config proposed by the created, accepted by the joiner => Part Started
     * 4 : part finished
     */

    // cancel feature for cause of smart phone bugs timeoutMinimalDuration: number;
    maximalMoveDuration?: number;
    totalPartDuration?: number;
    gameType?: number;
    /* pedagogic part
     * ranked part
     * friendly part
     */
}
export class Joiner {
    public constructor(
        private readonly candidatesNames: string[],
        private readonly creator: string,
        private readonly chosenPlayer: string,
        private readonly firstPlayer: string,
        private readonly partStatus: number,
        private readonly maximalMoveDuration?: number,
        private readonly totalPartDuration?: number,
        private readonly gameType?: number,
    ) {
        if (candidatesNames == null) throw new Error('candidatesNames can\'t be null');
        if (creator == null) throw new Error('creator can\'t be null');
        if (chosenPlayer == null) throw new Error('chosenPlayer can\'t be null');
        if (firstPlayer == null) throw new Error('firstPlayer can\'t be null');
        if (partStatus == null) throw new Error('partStatus can\'t be null');
    }
    public equals(j: IJoiner): boolean {
        if (j.candidatesNames == null) return false;
        if (j.candidatesNames.length !== this.candidatesNames.length) return false;
        for (let i = 0; i < j.candidatesNames.length; i++) {
            if (j.candidatesNames[i] !== this.candidatesNames[i]) {
                return false;
            }
        }
        if (j.creator !== this.creator) return false;
        if (j.chosenPlayer !== this.chosenPlayer) return false;
        if (j.firstPlayer !== this.firstPlayer) return false;
        if (j.partStatus !== this.partStatus) return false;
        if (j.maximalMoveDuration !== this.maximalMoveDuration) return false;
        if (j.totalPartDuration !== this.totalPartDuration) return false;
        if (j.gameType !== this.gameType) return false;
        return true;
    }
    public copy(): IJoiner {
        const copied: IJoiner = {
            candidatesNames: this.candidatesNames.map((e: string) => {
                return '' + e;
            }),
            creator: this.creator,
            chosenPlayer: this.chosenPlayer,
            firstPlayer: this.firstPlayer,
            partStatus: this.partStatus,
        };
        if (this.maximalMoveDuration != null) copied.maximalMoveDuration = this.maximalMoveDuration;
        if (this.totalPartDuration != null) copied.totalPartDuration = this.totalPartDuration;
        if (this.gameType != null) copied.gameType = this.gameType;

        return copied;
    }
}
export interface IJoinerId {

    id: string;

    doc: IJoiner;
}
export interface PIJoiner {

    candidatesNames?: string[];
    creator?: string;
    chosenPlayer?: string;
    firstPlayer?: string;
    /* 0: the creator
     * 1: the chosenPlayer
     * 2: random
     */

    partStatus?: number;
    /* 0 : part created, no chosenPlayer                                                               => waiting for acceptable candidate
     * 1 : part created, chosenPlayer selected, no config proposed                                     => waiting the creator to propose config
     * 2 : part created, chosenPlayer selected, config proposed by the creator                         => waiting the joiner to accept them
     * 3 : part created, chosenPlayer selected, config proposed by the created, accepted by the joiner => Part Started
     * 4 : part finished
     */

    maximalMoveDuration?: number;
    totalPartDuration?: number;
    gameType?: number;
    /* pedagogic part
     * ranked part
     * friendly part
     */
}
