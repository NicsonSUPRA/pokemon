'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const pokemons = ['Bulbasaur', 'Squirtle', 'Charmander'];

export default function CadastrarAluno() {
    const [nome, setNome] = useState('');
    const [pokemon, setPokemon] = useState<string>('');
    const [nivelEvolucao, setNivelEvolucao] = useState<number>(1);
    const [pontos, setPontos] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSalvar = async () => {
        if (!nome.trim()) return alert('O nome é obrigatório');
        if (!pokemon) return alert('Selecione um Pokémon');

        setLoading(true);
        try {
            await addDoc(collection(db, 'alunos'), {
                nome: nome.trim(),
                pokemon,
                evoluidoPara: pokemon, // começa igual ao inicial
                nivelEvolucao,
                pontos
            });
            alert('Aluno cadastrado com sucesso!');
            router.push('/'); // volta para a página inicial
        } catch (e) {
            console.error(e);
            alert('Erro ao cadastrar aluno');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 space-y-4">
            <h1 className="text-2xl font-semibold">Cadastrar Aluno</h1>

            <input
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border px-4 py-2"
            />

            <select
                value={pokemon}
                onChange={(e) => setPokemon(e.target.value)}
                className="w-full rounded-xl border px-4 py-2"
            >
                <option value="">Selecione um Pokémon</option>
                {pokemons.map((p) => (
                    <option key={p} value={p}>
                        {p}
                    </option>
                ))}
            </select>

            <input
                type="number"
                placeholder="Nível de evolução"
                value={nivelEvolucao}
                min={1}
                max={3}
                onChange={(e) => setNivelEvolucao(Number(e.target.value) || 1)}
                className="w-full rounded-xl border px-4 py-2"
            />

            <input
                type="number"
                placeholder="Pontos"
                value={pontos}
                min={0}
                onChange={(e) => setPontos(Number(e.target.value) || 0)}
                className="w-full rounded-xl border px-4 py-2"
            />

            <button
                onClick={handleSalvar}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition"
            >
                {loading ? 'Salvando...' : 'Salvar'}
            </button>
        </div>
    );
}
