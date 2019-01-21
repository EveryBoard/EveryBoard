export interface IJoiner {
	candidatesNames: string[];
	creator: string;
	chosenPlayer: string;
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

export interface IJoinerId {
	id: string;
	joiner: IJoiner;
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
