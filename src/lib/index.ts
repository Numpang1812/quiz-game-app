import { questionnaires } from './assets/questionnaires';

export type QuestionnaireAnswerKey = 'answer1' | 'answer2' | 'answer3';

export type Question = {
	id: string;
	prompt: string;
	answers: Record<QuestionnaireAnswerKey, string>;
	correct: QuestionnaireAnswerKey;
};

export type QuestionnaireItem = {
	id: string;
	message: string;
	answers: Array<Record<QuestionnaireAnswerKey, string>>;
	correct_answer: QuestionnaireAnswerKey;
};

export type ResultTier = {
	title: string;
	subtitle: string;
	className: 'tier-low' | 'tier-med' | 'tier-high';
};

export type ConfettiPiece = {
	id: number;
	left: number;
	duration: number;
	rotation: number;
	color: string;
};

export const totalTime = 30;
export const penaltySeconds = 3;

export const questions: Question[] = Object.values(questionnaires as Record<string, QuestionnaireItem>).map(
	(item) => ({
		id: item.id,
		prompt: item.message,
		answers: item.answers[0],
		correct: item.correct_answer
	})
);

export function randomQuestion(): Question {
	const index = Math.floor(Math.random() * questions.length);
	return questions[index];
}

export function shuffleOptions(question: Question): Array<[QuestionnaireAnswerKey, string]> {
	const entries = Object.entries(question.answers) as Array<[QuestionnaireAnswerKey, string]>;
	return [...entries].sort(() => Math.random() - 0.5);
}

export function getResultTier(currentScore: number): ResultTier {
	if (currentScore <= 5) {
		return { title: 'Sparse Soil', subtitle: 'Need more sunshine!', className: 'tier-low' };
	}

	if (currentScore <= 15) {
		return { title: 'Fresh Sprout!', subtitle: 'Your garden is growing!', className: 'tier-med' };
	}

	return { title: 'Master Harvester! 👑', subtitle: 'A legendary garden!', className: 'tier-high' };
}

export function timerPercent(timeLeft: number, totalTime: number): number {
	return Math.max(0, (Math.max(0, timeLeft) / totalTime) * 100);
}

export function plantStyle(index: number): string {
	const spacing = 45;
	const maxPerRow = Math.max(1, Math.floor(window.innerWidth / spacing));
	const row = Math.floor(index / maxPerRow);
	const col = index % maxPerRow;
	return `left:${col * spacing + 20}px;bottom:${row * 15 + 10}px;z-index:${30 - row};`;
}

export function plantSvg(level: number): string {
	if (level < 10) {
		return `
			<path d="M10 20 Q10 10 10 5" stroke="#1b5e20" stroke-width="2" fill="none" />
			<path d="M10 8 Q18 0 20 8 Q15 12 10 8" fill="#a0e080" stroke="#1b5e20" />
			<path d="M10 8 Q2 0 0 8 Q5 12 10 8" fill="#a0e080" stroke="#1b5e20" />
		`;
	}

	if (level < 20) {
		return `
			<path d="M10 20 L10 2" stroke="#1b5e20" stroke-width="2" />
			<circle cx="10" cy="2" r="4" fill="#ffeb3b" stroke="#1b5e20" />
			<path d="M10 10 Q18 5 20 12" stroke="#1b5e20" fill="none" />
		`;
	}

	return `
		<path d="M10 20 L10 5" stroke="#1b5e20" stroke-width="2" />
		<circle cx="10" cy="5" r="6" fill="#f44336" stroke="#1b5e20" />
		<circle cx="10" cy="5" r="2" fill="#ffeb3b" />
	`;
}
