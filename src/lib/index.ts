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

export const questions: Question[] = Object.values(
	questionnaires as Record<string, QuestionnaireItem>,
).map((item) => ({
	id: item.id,
	prompt: item.message,
	answers: item.answers[0],
	correct: item.correct_answer,
}));

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
			<!-- Stem -->
            <path d="M10 20 Q10 12 11 8" fill="none" stroke="#1b5e20" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Leaf 1 -->
            <path d="M10.5 14 Q4 11 3 16 Q8 18 10.5 14" fill="#a0e080" stroke="#1b5e20" stroke-width="0.5"/>
            <!-- Leaf 2 -->
            <path d="M10.5 11 Q17 8 18 13 Q14 15 10.5 11" fill="#a0e080" stroke="#1b5e20" stroke-width="0.5"/>
		`;
	}

	if (level < 15) {
		return `
            <!-- Stem -->
            <path d="M10 20 Q10 12 10 7" fill="none" stroke="#1b5e20" stroke-width="1.5" stroke-linecap="round"/>
            <!-- Leaves -->
            <path d="M10 15 Q5 13 4 17 Q8 18 10 15" fill="#a0e080" stroke="#1b5e20" stroke-width="0.5"/>
            <path d="M10 12 Q15 10 16 14 Q12 15 10 12" fill="#a0e080" stroke="#1b5e20" stroke-width="0.5"/>
            <!-- The Bud -->
            <path d="M10 7 C7 7, 7 1, 10 0 C13 1, 13 7, 10 7" fill="#F472B6" stroke="#DB2777" stroke-width="0.5"/>
            <path d="M8.5 6.5 Q10 5 11.5 6.5" fill="none" stroke="#1b5e20" stroke-width="1" stroke-linecap="round"/>
        `;
	}

	return `
        <!-- Stem -->
        <path d="M10 20 Q10 12 10 6" fill="none" stroke="#1b5e20" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Leaf -->
        <path d="M10 14 Q5 12 4 16 Q8 17 10 14" fill="#a0e080" stroke="#1b5e20" stroke-width="0.5"/>
        <!-- Flower Head -->
        <g transform="translate(10, 6) scale(0.25)">
            <circle cx="0" cy="-12" r="8" fill="#F472B6" />
            <circle cx="0" cy="12" r="8" fill="#F472B6" />
            <circle cx="-12" cy="0" r="8" fill="#F472B6" />
            <circle cx="12" cy="0" r="8" fill="#F472B6" />
            <!-- Center -->
            <circle cx="0" cy="0" r="6" fill="#FDE047" stroke="#EAB308" stroke-width="2"/>
        </g>
    `;
}
