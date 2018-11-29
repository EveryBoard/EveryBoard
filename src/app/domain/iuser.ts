export interface IUser {
	id: number;
	pseudo: string;
	email: string;
	dateInscription: Date;
	status: number; // playing, waiting-joiner, observering, chat-room, inactive, offline
}
