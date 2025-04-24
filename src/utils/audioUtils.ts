/**
 * 音声ファイルの長さを取得する関数
 * @param url 音声ファイルのURL
 * @returns 音声の長さ（秒）
 */
export const getAudioDuration = async (url: string): Promise<number> => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer.duration;
  } catch (error) {
    console.error('音声ファイルの長さ取得に失敗しました:', error);
    return 0;
  }
}; 