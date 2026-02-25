import { json } from '@sveltejs/kit';
import { getScore, postScore, initTable, getRank } from '../../../database/turso.server';

export async function GET(){
    await initTable();
    const scores = await getScore();
    return json(scores);
}

export async function POST({ request }) {
    await initTable();

    const body = await request.json().catch(() => null);

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const score = typeof body?.score === 'number' ? body.score : Number(body?.score);

    if (!Number.isFinite(score)) return json({ error: 'Score is required' }, {status: 400 });
    if (!name) return json({ error: 'Name is required' }, { status: 400 });

    await postScore(name, score);
    const rank = await getRank(score);

    return json({ ok: true, rank}, { status: 201 });
}