/**
 * モバイルデバイスかどうかを判定する関数
 * @returns モバイルデバイスの場合はtrue、PCの場合はfalse
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
  return isMobile;
}; 