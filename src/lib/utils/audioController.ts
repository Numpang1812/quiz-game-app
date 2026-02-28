import { browser } from '$app/environment';

type TrackType = 'mainMenu' | 'game' | 'result';

class AudioManager {
    currentTrack: TrackType | null = null;

    mainMenuMusic: HTMLAudioElement | null = null;
    gameMusic: HTMLAudioElement | null = null;
    

    startSound: HTMLAudioElement | null = null;
    clickSound: HTMLAudioElement | null = null;
    correctSound: HTMLAudioElement | null = null;
    wrongSound: HTMLAudioElement | null = null;
    gameOverSound: HTMLAudioElement | null = null;

    musicVolume = 0.6;
    sfxVolume = 0.8;
    musicMuted = true; 
    sfxMuted = false;

    init() {
        if (!browser) return;

        this.musicMuted = true;
        localStorage.setItem('musicMuted', 'true');

        if (this.mainMenuMusic) {
            this.applyVolumes();
            return;
        }

        const sfxMuted = localStorage.getItem('sfxMuted');
        const musicVolume = localStorage.getItem('musicVolume');
        const sfxVolume = localStorage.getItem('sfxVolume');

        if (sfxMuted !== null) this.sfxMuted = sfxMuted === 'true';
        if (musicVolume !== null) this.musicVolume = Number(musicVolume);
        if (sfxVolume !== null) this.sfxVolume = Number(sfxVolume);

        this.mainMenuMusic = new Audio('/sound/bgMusic.mp3');
        this.mainMenuMusic.loop = true;

        this.gameMusic = new Audio('/sound/game.mp3');
        this.gameMusic.loop = true;

        this.startSound = new Audio('/sound/start.mp3');
        this.clickSound = new Audio('/sound/button.mp3');
        this.correctSound = new Audio('/sound/right.mp3');
        this.wrongSound = new Audio('/sound/wrong.mp3');
        this.gameOverSound = new Audio('/sound/complete.mp3');

        this.applyVolumes();
    }

    applyVolumes() {
        if (this.mainMenuMusic)
            this.mainMenuMusic.volume = this.musicMuted ? 0 : this.musicVolume;

        if (this.gameMusic)
            this.gameMusic.volume = this.musicMuted ? 0 : this.musicVolume;
    }
    

    // bg music
    async playTrack(type: TrackType) {
        if (!browser || this.musicMuted) return;
        if (!this.mainMenuMusic || !this.gameMusic) return;

        if (this.currentTrack === type && !this.mainMenuMusic.paused) return;

        this.stopAllMusic();

        const track = 
            type === 'mainMenu'
                ? this.mainMenuMusic
                : this.gameMusic;

        track.currentTime = 0;
        track.volume = this.musicVolume;

        try {
            await track.play();
            this.currentTrack = type;
        } catch (e) {
            console.log("Autoplay blocked or interrupted")
        }
    }

    stopGameMusic() {
        if (this.gameMusic && !this.gameMusic.paused) {
            this.fade(this.gameMusic, this.gameMusic.volume, 0, 500, () => {
                this.currentTrack = null;
            });
        }
    }

    stopAllMusic() {
        this.mainMenuMusic?.pause();
        this.gameMusic?.pause();
        this.currentTrack = null;
    }

    toggleMusicMute() {
        this.musicMuted = !this.musicMuted;
        localStorage.setItem('musicMuted', String(this.musicMuted));

        if (this.musicMuted) {
            this.stopAllMusic();
        } else {
            this.resumeByRoute();
        }
    }

    resumeByRoute() {
        if (!browser) return;

        const path = window.location.pathname;

        if (path.startsWith('/game')) {
            this.playTrack('game');
        } else {
            this.playTrack('mainMenu');
        }
    }

    setMusicVolume(vol: number) {
        const previousVolume = this.musicVolume;
        this.musicVolume = vol;
        localStorage.setItem('musicVolume', String(vol));

        if (vol === 0) {
            this.musicMuted = true;
            localStorage.setItem('musicMuted', 'true');
            this.stopAllMusic();
        } else {
            if (this.musicMuted) {
                if (vol > previousVolume) {
                    this.musicMuted = false;
                    localStorage.setItem('musicMuted', 'false');
                    this.resumeByRoute();
                }
            }
        }
    
        if (this.mainMenuMusic) this.mainMenuMusic.volume = vol;
        if (this.gameMusic) this.gameMusic.volume = vol;
    }

    // sfx
    playClick() {
        if (this.sfxMuted) return;
        this.playSfx(this.clickSound);
    }

    playCorrect() {
        if (this.sfxMuted) return;
        this.playSfx(this.correctSound);
    }

    playWrong() {
        if (this.sfxMuted) return;
        this.playSfx(this.wrongSound);
    }

    playStart() {
        if (this.sfxMuted) return;
        this.playSfx(this.startSound);
    }

    playSfx(audio: HTMLAudioElement | null) {
        if (!audio) return;

        const clone = audio.cloneNode(true) as HTMLAudioElement;
        clone.volume = this.sfxVolume;
        clone.play();
    }

    setSfxVolume(vol: number) {
        const previousVolume = this.sfxVolume;
        this.sfxVolume = vol;
        localStorage.setItem('sfxVolume', String(vol));

        if (vol === 0) {
            this.sfxMuted = true;
            localStorage.setItem('sfxMuted', 'true');
        } else {
            if (this.sfxMuted) {
                if (vol > previousVolume) {
                    this.sfxMuted = false;
                    localStorage.setItem('sfxMuted', 'false');
                }
            }
        }
    }

    toggleSfxMute() {
        this.sfxMuted = !this.sfxMuted;
        localStorage.setItem('sfxMuted', String(this.sfxMuted));
    }

    playGameOver() {
        if (!this.sfxMuted) this.playSfx(this.gameOverSound);
    }

    // utils
    duckMusic(level = 0.25) {
        if (this.mainMenuMusic && !this.mainMenuMusic.paused) {
            this.fade(this.mainMenuMusic, this.mainMenuMusic.volume, level, 200);
        }
        if (this.gameMusic && !this.gameMusic.paused) {
            this.fade(this.gameMusic, this.gameMusic.volume, level, 200);
        }
    }

    restoreMusic() {
        if (!this.musicMuted) {
            if (this.mainMenuMusic && !this.mainMenuMusic.paused) {
                this.fade(
                    this.mainMenuMusic,
                    this.mainMenuMusic.volume,
                    this.musicVolume,
                    300
                );
            }
            if (this.gameMusic && !this.gameMusic.paused) {
                this.fade(
                    this.gameMusic,
                    this.gameMusic.volume,
                    this.musicVolume,
                    300
                );
            }
        }
    }

    fade(
        audio: HTMLAudioElement,
        from: number,
        to: number,
        duration: number,
        callback?: () => void
    ) {
        const stepTime = 50;
        const steps = duration / stepTime;
        const stepSize = (to - from) / steps;

        let current = from;
        audio.volume = from;

        const interval = setInterval(() => {
            current += stepSize;
            audio.volume = Math.max(0, Math.min(1, current));

            if (
                (stepSize > 0 && current >= to) ||
                (stepSize < 0 && current <= to)
            ) {
                clearInterval(interval);
                audio.volume = to;
                callback?.();
            }
        }, stepTime);
    }
}

export const audioManager = new AudioManager();