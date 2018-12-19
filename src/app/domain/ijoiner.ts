export interface IJoiner {
	candidatesNames: string[];
	creator: string;
	chosenPlayer: string;
	firstPlayer: number;
	/* 0: the creator
	 * 1: the chosenPlayer
	 * 2: random
	 */

	partStatus: number;
	/* 0 : part created, no chosenPlayer
	 * 1 : part created, chosenPlayer selected, no config proposed
	 * 2 : part created, chosenPlayer selected, config proposed by the creator
	 * 3 : part created, chosenPlayer selected, config proposed by the created, accepted by the joiner => Part Started
	 * 4 : part finished
	 */

	timeoutMinimalDuration: number;
	maximalMoveDuration?: number;
	totalPartDuration?: number;
	gameType?: number;
	/* pedagogic part
	 * ranked part
	 * friendly part
	 */
}

export interface IJoinerId {
	id: string;
	joiner: IJoiner;
}
