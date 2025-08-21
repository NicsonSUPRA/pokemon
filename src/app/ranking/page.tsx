'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Aluno } from '@/types/aluno';

export default function Ranking() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregarAlunos() {
            try {
                const snap = await getDocs(collection(db, 'alunos'));
                const lista: Aluno[] = snap.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as any)
                }));
                setAlunos(lista);
            } catch (e) {
                console.error('Erro ao buscar ranking:', e);
            } finally {
                setLoading(false);
            }
        }
        carregarAlunos();
    }, []);

    if (loading) return <p className="text-center mt-10">Carregando ranking...</p>;

    // Agrupar por Pokémon
    const grupos = alunos.reduce((acc, aluno) => {
        const poke = aluno.pokemon ?? 'Desconhecido';
        if (!acc[poke]) acc[poke] = [];
        acc[poke].push(aluno);
        return acc;
    }, {} as Record<string, Aluno[]>);

    // Ordenar cada grupo por pontuação decrescente
    Object.keys(grupos).forEach(poke => {
        grupos[poke].sort((a, b) => (b.pontos ?? 0) - (a.pontos ?? 0));
    });

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow space-y-8">
            <h1 className="text-3xl font-bold text-center">🏆 Ranking de Alunos</h1>

            {Object.keys(grupos).map(pokemon => (
                <div key={pokemon} className="space-y-4">
                    <h2 className="text-2xl font-semibold text-indigo-600">{pokemon}</h2>
                    <ul className="space-y-2">
                        {grupos[pokemon].map((aluno, index) => (
                            <li
                                key={aluno.id}
                                className="flex items-center justify-between p-3 bg-gray-100 rounded-xl"
                            >
                                <span>
                                    <strong>{index + 1}º</strong> - {aluno.nome}
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({aluno.nivelEvolucao ?? '—'})
                                    </span>
                                </span>
                                <span className="font-bold">{aluno.pontos ?? 0} pts</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
