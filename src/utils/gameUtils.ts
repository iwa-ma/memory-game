/**
 * レベルに応じた数字のシーケンスを生成する関数
 * @param level 現在のレベル
 * @param range 生成する数字の範囲（0からrange-1まで）
 * @returns 生成された数字の配列
 */
export const generateSequence = (level: number, range: number): number[] => {
  // 生成する数字の数(レベルに応じて数を増やす)
  const sequenceLength = level + 1;
  
  // 出題の個数分数字を生成
  const sequence = Array.from(
    { length: sequenceLength },
    () => Math.floor(Math.random() * range)
  );

  return sequence;
};