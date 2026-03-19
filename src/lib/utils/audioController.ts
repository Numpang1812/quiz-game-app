import { browser } from '$app/environment'

type TrackType = 'mainMenu' | 'game' | 'result'

class AudioManager {
	currentTrack: TrackType | null = null

	mainMenuMusic: HTMLAudioElement | null = null
	gameMusic: HTMLAudioElement | null = null

	startSound: HTMLAudioElement | null = null
	clickSound: HTMLAudioElement | null = null
	correctSound: HTMLAudioElement | null = null
	wrongSound: HTMLAudioElement | null = null
	gameOverSound: HTMLAudioElement | null = null

	musicVolume = 0.6
	sfxVolume = 0.8
	musicMuted = true
	sfxMuted = false
	isGameOver = false

	init() {
		if (!browser) return

		this.musicMuted = true
		localStorage.setItem('musicMuted', 'true')

		if (this.mainMenuMusic) {
			this.applyVolumes()
			return
		}

		const sfxMuted = localStorage.getItem('sfxMuted')
		const musicVolume = localStorage.getItem('musicVolume')
		const sfxVolume = localStorage.getItem('sfxVolume')

		if (sfxMuted !== null) this.sfxMuted = sfxMuted === 'true'
		if (musicVolume !== null) this.musicVolume = Number(musicVolume)
		if (sfxVolume !== null) this.sfxVolume = Number(sfxVolume)

		this.mainMenuMusic = new Audio('/sound/bgMusic.mp3')
		this.mainMenuMusic.loop = true

		this.gameMusic = new Audio('/sound/game.mp3')
		this.gameMusic.loop = true

		this.startSound = new Audio('/sound/start.mp3')
		this.clickSound = new Audio('/sound/button.mp3')
		this.correctSound = new Audio('/sound/right.mp3')
		this.wrongSound = new Audio('/sound/wrong.mp3')
		this.gameOverSound = new Audio('/sound/complete.mp3')

		this.applyVolumes()
	}

	applyVolumes() {
		if (this.mainMenuMusic) this.mainMenuMusic.volume = this.musicMuted ? 0 : this.musicVolume

		if (this.gameMusic) this.gameMusic.volume = this.musicMuted ? 0 : this.musicVolume
	}

	// bg music
	async playTrack(type: TrackType, fadeDuration = 0) {
		if (!browser || this.musicMuted) return
		if (!this.mainMenuMusic || !this.gameMusic) return

		const targetTrack = type === 'mainMenu' ? this.mainMenuMusic : this.gameMusic
		const otherTrack = type === 'mainMenu' ? this.gameMusic : this.mainMenuMusic

		if (!targetTrack.paused && targetTrack.currentTime > 0) {
			this.currentTrack = type
			return
		}

		this.stopOtherTrack(otherTrack, fadeDuration)

		if (this.currentTrack !== type) {
			targetTrack.currentTime = 0
		}

		this.currentTrack = type

		try {
			if (fadeDuration > 0) {
				targetTrack.volume = 0
				await targetTrack.play()
				this.fade(targetTrack, 0, this.musicVolume, fadeDuration)
			} else {
				targetTrack.volume = this.musicVolume
				await targetTrack.play()
			}
		} catch {
			console.warn('Autoplay blocked or interrupted')
		}
	}

	// Refactored stopOtherTrack function for better complexity.
	private stopOtherTrack(track: HTMLAudioElement, fadeDuration: number) {
		if (!track.paused) {
			if (fadeDuration > 0) {
				this.fade(track, track.volume, 0, fadeDuration, () => {
					track.pause()
					track.currentTime = 0
				})
			} else {
				track.pause()
				track.currentTime = 0
			}
		}
	}

	stopGameMusic() {
		if (this.gameMusic && !this.gameMusic.paused) {
			this.fade(this.gameMusic, this.gameMusic.volume, 0, 500, () => {
				this.currentTrack = null
			})
		}
	}

	stopAllMusic() {
		this.mainMenuMusic?.pause()
		this.gameMusic?.pause()
		this.currentTrack = null
	}

	toggleMusicMute() {
		this.musicMuted = !this.musicMuted
		localStorage.setItem('musicMuted', String(this.musicMuted))

		if (this.musicMuted) {
			this.stopAllMusic()
		} else {
			this.resumeByRoute()
		}
	}

	resumeByRoute() {
		if (!browser) return

		const path = window.location.pathname

		if (path.startsWith('/game') && !this.isGameOver) {
			this.playTrack('game')
		} else {
			this.playTrack('mainMenu')
		}
	}

	setMusicVolume(vol: number) {
		const previousVolume = this.musicVolume
		this.musicVolume = vol
		localStorage.setItem('musicVolume', String(vol))

		if (vol === 0) {
			this.musicMuted = true
			localStorage.setItem('musicMuted', 'true')
			this.stopAllMusic()
		} else {
			if (this.musicMuted) {
				if (vol > previousVolume) {
					this.musicMuted = false
					localStorage.setItem('musicMuted', 'false')
					this.resumeByRoute()
				}
			}
		}

		if (this.mainMenuMusic) this.mainMenuMusic.volume = vol
		if (this.gameMusic) this.gameMusic.volume = vol
	}

	// sfx
	playClick() {
		if (this.sfxMuted) return
		this.playSfx(this.clickSound)
	}

	playCorrect() {
		if (this.sfxMuted) return
		this.playSfx(this.correctSound)
	}

	playWrong() {
		if (this.sfxMuted) return
		this.playSfx(this.wrongSound)
	}

	playStart() {
		if (this.sfxMuted) return
		this.playSfx(this.startSound)
	}

	playSfx(audio: HTMLAudioElement | null) {
		if (!audio) return

		const clone = audio.cloneNode(true) as HTMLAudioElement
		clone.volume = this.sfxVolume
		clone.play()
	}

	setSfxVolume(vol: number) {
		const previousVolume = this.sfxVolume
		this.sfxVolume = vol
		localStorage.setItem('sfxVolume', String(vol))

		if (vol === 0) {
			this.sfxMuted = true
			localStorage.setItem('sfxMuted', 'true')
		} else {
			if (this.sfxMuted) {
				if (vol > previousVolume) {
					this.sfxMuted = false
					localStorage.setItem('sfxMuted', 'false')
				}
			}
		}
	}

	toggleSfxMute() {
		this.sfxMuted = !this.sfxMuted
		localStorage.setItem('sfxMuted', String(this.sfxMuted))
	}

	playGameOver() {
		this.isGameOver = true
		if (!this.sfxMuted) this.playSfx(this.gameOverSound)
		this.playTrack('mainMenu')
	}

	// utils
	duckMusic(level = 0.25) {
		if (this.mainMenuMusic && !this.mainMenuMusic.paused) {
			this.fade(this.mainMenuMusic, this.mainMenuMusic.volume, level, 200)
		}
		if (this.gameMusic && !this.gameMusic.paused) {
			this.fade(this.gameMusic, this.gameMusic.volume, level, 200)
		}
	}

	restoreMusic() {
		if (!this.musicMuted) {
			if (this.mainMenuMusic && !this.mainMenuMusic.paused) {
				this.fade(this.mainMenuMusic, this.mainMenuMusic.volume, this.musicVolume, 300)
			}
			if (this.gameMusic && !this.gameMusic.paused) {
				this.fade(this.gameMusic, this.gameMusic.volume, this.musicVolume, 300)
			}
		}
	}

	fade(audio: HTMLAudioElement, from: number, to: number, duration: number, callback?: () => void) {
		const stepTime = 50
		const steps = duration / stepTime
		const stepSize = (to - from) / steps

		let current = from
		audio.volume = from

		const interval = setInterval(() => {
			current += stepSize
			audio.volume = Math.max(0, Math.min(1, current))

			if ((stepSize > 0 && current >= to) || (stepSize < 0 && current <= to)) {
				clearInterval(interval)
				audio.volume = to
				callback?.()
			}
		}, stepTime)
	}
}

export const audioManager = new AudioManager()
