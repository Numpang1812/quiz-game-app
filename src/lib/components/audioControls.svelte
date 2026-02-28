<script lang="ts">
    import { audioManager } from '$lib/utils/audioController';
    import { onMount } from 'svelte';

    let musicMuted = true;
    let sfxMuted = false;
    let musicVolume = 0.6;
    let sfxVolume = 0.8;

    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    function closeMenu() {
        isMenuOpen = false;
    }

    onMount(() => {
        audioManager.init();
        syncFromManager();
    });

    function syncFromManager() {
        musicMuted = audioManager.musicMuted;
        sfxMuted = audioManager.sfxMuted;
        musicVolume = audioManager.musicVolume;
        sfxVolume = audioManager.sfxVolume;
    }

    function toggleMusic() {
        audioManager.playClick();
        audioManager.toggleMusicMute();
        syncFromManager();
    }

    function toggleSfx() {
        audioManager.playClick();
        audioManager.toggleSfxMute();
        syncFromManager();
    }

    function updateMusicVolume(value: number) {
        audioManager.setMusicVolume(value);
        syncFromManager();
    }

    function updateSfxVolume(value: number) {
        audioManager.setSfxVolume(value);
        syncFromManager();
    }

    function onSliderInteraction() {
        audioManager.playClick();
    }

    function handleTriggerClick(event: MouseEvent | TouchEvent) {
        isMenuOpen = !isMenuOpen;
    }
</script>

<nav class="audio-settings" on:mouseleave={closeMenu}>
    <button 
        type="button" 
        class="audio-trigger" 
        on:mouseenter={handleTriggerClick}
        aria-label="Audio Settings"
    >
        <svg viewBox="0 0 24 24" width="28" height="28">
            <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
    </button>

    {#if isMenuOpen}
    <div class="audio-panel">

        <!-- music control -->
        <span class="label">Music</span>
        <div class="control">
            <button class="mute-btn" on:click={toggleMusic} aria-label="Toggle Music">
                {#if musicMuted}                   
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                {:else}
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                {/if}
            </button>

            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                bind:value={musicVolume}
                on:input={(e) =>
                    updateMusicVolume(
                        +(e.target as HTMLInputElement).value
                    )
                }
                on:pointerdown={onSliderInteraction}
            />
        </div>

        <!-- SFX control -->
        <span class="label">SFX</span>
        <div class="control">
            <button class="mute-btn" on:click={toggleSfx} aria-label="Toggle SFX">
                {#if sfxMuted}                  
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                {:else}
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                {/if}
            </button>

            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                bind:value={sfxVolume}
                on:input={(e) =>
                    updateSfxVolume(
                        +(e.target as HTMLInputElement).value
                    )
                }
                on:pointerdown={onSliderInteraction}
            />
        </div>
    </div>
    {/if}
</nav>

<style>
    .audio-settings {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .audio-trigger {
        background: white;
        border: 3px solid #007209;
        color: #007209;
        border-radius: 50%;
        width: 4vw;
        height: 4vw;
        min-width: 40px;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s, background 0.2s;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .audio-trigger:hover {
        transform: scale(1.1);
        background: #f0ffe7;
    }

    .audio-panel {
        margin-top: 10px;
        background: rgb(250, 255, 237);
        border: 2px solid #007209;
        border-radius: 12px;
        padding: 15px;
        width: 180px;
        animation: slideDown 0.2s ease-out;
    }

    .label {
        font-family: cursive;
        color: #007209;
        padding: 5px;
    }

    .mute-btn :global(line) {
        stroke: #ef4444; 
    }
    
    .control {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    button {
        font-size: 18px;
        background: none;
        border: none;
        cursor: pointer;
    }

    input[type="range"] {
        width: 120px;
        accent-color: #007209;
    }

    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
        .audio-trigger {
            width: 60px;
            height: 60px;
        }
        .audio-panel {
            width: 220px;
        }
    }
</style>