/** 音声種類の変換 */
export const convertSoundType = (soundType: string): string => {
  switch (soundType) {
    case 'human1':
      return '音声1';
    case 'human2':
      return '音声2';
    case 'animal1':
      return '猫';
    default:
      return soundType;
  }
};

/** 難易度の変換 */
export const convertDifficulty = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return '簡単';
    case 'normal':
      return '普通';
    case 'hard':
      return '難しい';
    default:
      return difficulty;
  }
}; 