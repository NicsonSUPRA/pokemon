'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import type { Aluno } from '@/types/aluno';

// Cadeias de evolução
const cadeias: Record<string, string[]> = {
    Bulbasaur: ['Bulbasaur', 'Ivysaur', 'Venusaur'],
    Ivysaur: ['Bulbasaur', 'Ivysaur', 'Venusaur'],
    Venusaur: ['Bulbasaur', 'Ivysaur', 'Venusaur'],

    Squirtle: ['Squirtle', 'Wartortle', 'Blastoise'],
    Wartortle: ['Squirtle', 'Wartortle', 'Blastoise'],
    Blastoise: ['Squirtle', 'Wartortle', 'Blastoise'],

    Charmander: ['Charmander', 'Charmeleon', 'Charizard'],
    Charmeleon: ['Charmander', 'Charmeleon', 'Charizard'],
    Charizard: ['Charmander', 'Charmeleon', 'Charizard'],
};

function calcularEvolucao(base: string, pontos: number) {
    const cadeia = cadeias[base] ?? [base];
    const idx = Math.min(Math.floor(pontos / 100), cadeia.length - 1);
    return {
        nome: cadeia[idx],
        nivel: idx + 1,
    };
}

export default function DetalheAluno() {
    const params = useParams();
    const router = useRouter();
    const [aluno, setAluno] = useState<Aluno | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [pontosAlterar, setPontosAlterar] = useState<number>(0);
    const [atualizando, setAtualizando] = useState(false);

    useEffect(() => {
        async function carregarAluno() {
            try {
                const id = Array.isArray(params.id) ? params.id[0] : params.id;
                if (!id) {
                    setErro('ID do aluno inválido');
                    setLoading(false);
                    return;
                }

                const ref = doc(db, 'alunos', id);
                const snap = await getDoc(ref);

                if (!snap.exists()) {
                    setErro('Aluno não encontrado');
                } else {
                    const data = snap.data() as Omit<Aluno, 'id'>;
                    setAluno({
                        id: snap.id,
                        nome: data.nome ?? '',
                        pokemon: data.pokemon ?? 'Bulbasaur',
                        evoluidoPara: data.evoluidoPara ?? data.pokemon ?? 'Bulbasaur',
                        nivelEvolucao: data.nivelEvolucao ?? 1,
                        pontos: data.pontos ?? 0,
                    });
                }
            } catch (e: unknown) {
                const mensagem = e instanceof Error ? e.message : 'Erro desconhecido';
                console.error('Erro ao buscar aluno:', mensagem);
                setErro(mensagem);
            } finally {
                setLoading(false);
            }
        }

        carregarAluno();
    }, [params.id]);

    const handleAtualizarPontos = async () => {
        if (!aluno || pontosAlterar === 0) return;

        setAtualizando(true);
        try {
            const ref = doc(db, 'alunos', aluno.id);

            const resultado = await runTransaction(db, async (tx) => {
                const snap = await tx.get(ref);
                if (!snap.exists()) throw new Error('Aluno não encontrado');

                const data = snap.data() as Omit<Aluno, 'id'>;
                const pontosAtuais = data.pontos ?? 0;
                const novoTotal = Math.max(0, pontosAtuais + pontosAlterar);

                const base = data.pokemon ?? aluno.pokemon ?? 'Bulbasaur';
                const { nome: evolucaoAtual, nivel } = calcularEvolucao(base, novoTotal);

                tx.update(ref, {
                    pontos: novoTotal,
                    evoluidoPara: evolucaoAtual,
                    nivelEvolucao: nivel,
                });

                return { novoTotal, evolucaoAtual, nivel, base };
            });

            setAluno((prev) =>
                prev
                    ? {
                        ...prev,
                        pontos: resultado.novoTotal,
                        evoluidoPara: resultado.evolucaoAtual,
                        nivelEvolucao: resultado.nivel,
                        pokemon: resultado.base,
                    }
                    : prev
            );

            setPontosAlterar(0);
            alert('Pontos e evolução atualizados!');
        } catch (e: unknown) {
            const mensagem = e instanceof Error ? e.message : String(e);
            console.error('Erro ao atualizar pontos:', mensagem);
            alert(`Erro ao atualizar pontos: ${mensagem}`);
        } finally {
            setAtualizando(false);
        }
    };

    if (loading) return <p className="text-center mt-10">Carregando...</p>;
    if (erro) return <p className="text-center mt-10 text-red-600">{erro}</p>;
    if (!aluno) return null;

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md space-y-4">
            <button
                className="text-indigo-600 hover:underline"
                onClick={() => router.push('/')}
            >
                ← Voltar
            </button>

            <h1 className="text-2xl font-semibold">{aluno.nome}</h1>
            <p><strong>Pokémon inicial:</strong> {aluno.pokemon}</p>
            <p><strong>Evolução atual:</strong> {aluno.evoluidoPara}</p>
            <p><strong>Nível de evolução:</strong> {aluno.nivelEvolucao}</p>
            <p><strong>Pontos:</strong> {aluno.pontos}</p>

            <div className="space-y-2 mt-4">
                <input
                    type="number"
                    value={pontosAlterar}
                    onChange={(e) => {
                        const n = Number(e.target.value);
                        setPontosAlterar(Number.isNaN(n) ? 0 : n);
                    }}
                    placeholder="Digite pontos (+ para somar, - para reduzir)"
                    className="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                    onClick={handleAtualizarPontos}
                    disabled={atualizando}
                    className={`w-full py-2 rounded-xl text-white transition ${atualizando
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {atualizando ? 'Atualizando...' : 'Atualizar Pontos'}
                </button>
            </div>
        </div>
    );
}
