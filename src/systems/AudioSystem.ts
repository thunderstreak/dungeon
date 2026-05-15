// 音频系统 - BGM切换、音效播放、音量控制

import { eventBus } from './EventBus';

// ==================== 音频配置 ====================

/** BGM场景类型 */
export type BgmScene = 'menu' | 'town' | 'dungeon' | 'battle' | 'boss';

/** 音效类型 */
export type SfxType = 'attack' | 'hit' | 'skill' | 'pickup' | 'ui' | 'levelup' | 'enhance';

/** 音频状态 */
interface AudioState {
  bgmVolume: number;      // 0~1
  sfxVolume: number;      // 0~1
  bgmMuted: boolean;
  sfxMuted: boolean;
  currentBgm: BgmScene | null;
}

// ==================== 全局状态 ====================

const state: AudioState = {
  bgmVolume: 0.7,
  sfxVolume: 0.8,
  bgmMuted: false,
  sfxMuted: false,
  currentBgm: null,
};

// ==================== 音量控制 ====================

/** 设置BGM音量 (0~1) */
export function setBgmVolume(volume: number): void {
  state.bgmVolume = Math.max(0, Math.min(1, volume));
  eventBus.emit('audio:bgmVolumeChange', { volume: state.bgmVolume });
}

/** 获取BGM音量 */
export function getBgmVolume(): number {
  return state.bgmVolume;
}

/** 设置音效音量 (0~1) */
export function setSfxVolume(volume: number): void {
  state.sfxVolume = Math.max(0, Math.min(1, volume));
  eventBus.emit('audio:sfxVolumeChange', { volume: state.sfxVolume });
}

/** 获取音效音量 */
export function getSfxVolume(): number {
  return state.sfxVolume;
}

/** 静音/取消静音BGM */
export function toggleBgmMute(): boolean {
  state.bgmMuted = !state.bgmMuted;
  return state.bgmMuted;
}

/** 静音/取消静音音效 */
export function toggleSfxMute(): boolean {
  state.sfxMuted = !state.sfxMuted;
  return state.sfxMuted;
}

/** 获取BGM静音状态 */
export function isBgmMuted(): boolean {
  return state.bgmMuted;
}

/** 获取音效静音状态 */
export function isSfxMuted(): boolean {
  return state.sfxMuted;
}

// ==================== BGM控制 ====================

/** 播放BGM (切换场景时调用) */
export function playBgm(scene: BgmScene): void {
  if (state.currentBgm === scene) return; // 已在播放

  state.currentBgm = scene;
  eventBus.emit('audio:playBgm', { scene, volume: state.bgmMuted ? 0 : state.bgmVolume });
}

/** 停止BGM */
export function stopBgm(): void {
  state.currentBgm = null;
  eventBus.emit('audio:stopBgm', undefined as never);
}

/** 获取当前播放的BGM场景 */
export function getCurrentBgm(): BgmScene | null {
  return state.currentBgm;
}

// ==================== 音效播放 ====================

/** 播放音效 */
export function playSfx(type: SfxType): void {
  if (state.sfxMuted) return;

  eventBus.emit('audio:playSfx', { type, volume: state.sfxVolume });
}

// ==================== 状态查询 ====================

/** 获取完整音频状态 */
export function getAudioState(): AudioState {
  return { ...state };
}
