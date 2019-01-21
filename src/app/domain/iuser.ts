export interface IUser {
	code: string;
	pseudo: string;
	email?: string;
	inscriptionDate?: number;
	lastActionTime: number;
	lastMoveTime?: number;
	status?: number; // playing, waiting-joiner, observering, chat-room, inactive, offline
}

export interface PIUser {
	code?: string;
	pseudo?: string;
	email?: string;
	inscriptionDate?: number;
	lastActionTime?: number;
	lastMoveTime?: number;
	status?: number; // playing, waiting-joiner, observering, chat-room, inactive, offline
}

export interface IUserId {
	id: string;
	user: IUser;
}

export class User {
	constructor(
		public code: string, // lol
		public pseudo: string,
		public email: string,
		public inscriptionDate: number,
		public lastActionTime: number,
		public lastMoveTime: number,
		public status: number) {}
}
