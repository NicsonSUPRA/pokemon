export type Aluno = {
    id: string;           // ID do documento no Firestore
    nome: string;         // Nome do aluno
    evoluidoPara?: string; // Nome do Pokémon evoluído (opcional)
    pokemon?: string;
    nivelEvolucao?: number; // Nível de evolução (opcional)
    pontos?: number;       // Pontos do aluno (opcional)
};
