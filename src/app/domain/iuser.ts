export interface Time {
    seconds: number;
}

// TODO IJoueur and PIJoueur are the same interface, they should be merged
export interface IJoueur {
    pseudo: string;
    email?: string;
    displayName?: string;
    lastChanged?: Time;
    emailVerified?: boolean;
}

export interface PIJoueur {
    pseudo?: string;
    email?: string;
    displayName?: string;
    lastChanged?: Time;
    emailVerified?: boolean;
}

export interface IJoueurId {
    id: string;
    doc: IJoueur;
}
