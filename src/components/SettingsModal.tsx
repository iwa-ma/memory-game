/** 設定変更モーダルコンポーネントのProps型 */
interface SettingsModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** モーダルを閉じる関数 */
  onClose: () => void;
}

/** 設定変更モーダルコンポーネント */
export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>設定変更</h2>
        <div className="settings-section">
          <h3>音声の種類</h3>
          <select>
            <option value="voice1">音声1</option>
            <option value="voice2">音声2</option>
            <option value="cat">猫</option>
          </select>
        </div>

        <div className="settings-section">
          <h3>出題音声</h3>
          <div className="toggle-group">
            <label>
              <input type="radio" name="questionVoice" value="on" defaultChecked />
              オン
            </label>
            <label>
              <input type="radio" name="questionVoice" value="off" />
              オフ
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>ボタンタッチ効果音</h3>
          <div className="toggle-group">
            <label>
              <input type="radio" name="buttonSound" value="on" defaultChecked />
              オン
            </label>
            <label>
              <input type="radio" name="buttonSound" value="off" />
              オフ
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>開始レベル(1~10)</h3>
          <input 
            type="number" 
            min="1" 
            max="10" 
            defaultValue="1"
          />
        </div>

        <div className="settings-section">
          <h3>難易度</h3>
          <select>
            <option value="easy">簡単</option>
            <option value="normal">普通</option>
            <option value="hard">難しい</option>
          </select>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}; 