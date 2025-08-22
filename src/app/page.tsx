'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Aluno } from '@/types/aluno';

export default function HomePage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [termo, setTermo] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const ref = collection(db, 'alunos');
        const q = query(ref, orderBy('nome'));
        const snap = await getDocs(q);

        // Aqui tipamos corretamente cada documento
        const itens: Aluno[] = snap.docs.map(doc => {
          const data = doc.data() as Omit<Aluno, 'id'>; // pegando todos os campos exceto id
          return { id: doc.id, ...data };
        });

        setAlunos(itens);
      } catch (e: unknown) {
        const mensagem = e instanceof Error ? e.message : 'Erro ao carregar alunos';
        setErro(mensagem);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const t = termo.trim().toLowerCase();
    if (!t) return alunos;

    return alunos.filter(
      a =>
        a.nome?.toLowerCase().includes(t) ||
        a.pokemon?.toLowerCase().includes(t)
    );
  }, [alunos, termo]);

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Alunos</h1>
        <div className="flex gap-3">
          <Link
            href="/ranking"
            className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition"
          >
            🏆 Ver Ranking
          </Link>
          <Link
            href="/cadastrar"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            Cadastrar Aluno
          </Link>
        </div>
      </div>

      <input
        value={termo}
        onChange={e => setTermo(e.target.value)}
        placeholder="Buscar por nome ou Pokémon"
        className="w-full rounded-2xl border px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
      />

      {loading && <p className="text-gray-500">Carregando...</p>}
      {erro && <p className="text-red-600">{erro}</p>}

      {!loading && !erro && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map(a => (
            <li key={a.id}>
              <Link
                href={`/aluno/${a.id}`}
                className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <h2 className="font-medium text-lg">{a.nome}</h2>
                <p className="text-sm text-gray-500">Pokémon: {a.pokemon ?? '—'}</p>
                {a.nivelEvolucao !== undefined && (
                  <p className="text-sm text-gray-500">Nível: {a.nivelEvolucao}</p>
                )}
                {a.pontos !== undefined && (
                  <p className="text-sm text-gray-500">Pontos: {a.pontos}</p>
                )}
              </Link>
            </li>
          ))}
          {filtrados.length === 0 && <li className="text-gray-500">Nenhum aluno encontrado.</li>}
        </ul>
      )}
    </div>
  );
}
