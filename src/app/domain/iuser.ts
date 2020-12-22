export interface IJoueur {
    pseudo: string;
    email?: string;
    displayName?: string;
    last_changed?: number | Object;
    emailVerified?: boolean;
}

export interface PIJoueur {
    pseudo?: string;
    email?: string;
    displayName?: string;
    last_changed?: number | Object;
    emailVerified?: boolean;
}

export interface IJoueurId {
    id: string;
    doc: IJoueur;
}
