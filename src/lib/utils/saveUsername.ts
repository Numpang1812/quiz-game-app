export function getUsername(username: string) {		
    localStorage.setItem('quiz-username', username.trim() || 'Player');
}

export function returnCurrentUser() {
    return localStorage.getItem('quiz-username') || 'Player';
}

export function clearUsername() {
    localStorage.removeItem('quiz-username');
}