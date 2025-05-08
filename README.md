## アプリケーション名
記憶力ゲーム

## 想定用途
- 短時間（3-5分）で楽しめる手軽な記憶力トレーニング
- 仕事や勉強の合間の気分転換
- 通勤・通学時の暇つぶし
- 家族や友人との対戦ゲームとして

## 開発目的
 - Reactの技術習得
 - CI/CDの理解

## スクリーンショット
<img src="https://github.com/user-attachments/assets/6ab47df9-9860-49da-a72d-677f48be5982" width="30%">
<img src="https://github.com/user-attachments/assets/30b38dcb-a2df-420b-b3af-458df756cf8b" width="30%">
<img src="https://github.com/user-attachments/assets/b9af0845-b979-4068-af31-5347a8d2ba91" width="30%">
<img src="https://github.com/user-attachments/assets/fdff76ca-4dbb-4f97-8c5b-f14089e6cc74" width="30%">

## 機能
- **ゲームプレイ**
  - 数字の順番を記憶して再現するゲーム
  - レベルに応じて難易度が上昇
  - コンボボーナスによる高得点チャレンジ
  - タイムボーナスによるスピードチャレンジ

- **スコア管理**
  - ハイスコアの記録と表示
  - レベルごとのスコア集計
  - コンボボーナスの加算
  - タイムボーナスの加算

- **設定変更**
  - 音声のオン/オフ切り替え
  - 問題の音声タイプ選択（人/動物）
  - 開始レベルの設定
  - 難易度レベルの調整

- **その他の機能**
  - 入力履歴の表示
  - ライフシステムによるゲーム継続性
  - スマートフォン・PC向けレスポンシブデザイン対応

## 技術スタック
- **フレームワーク**
  - React (19.0.0)
  - Vite (6.3.5)
  - TanStack Router (1.114.3)

- **バックエンド/データベース**
  - Firebase (11.6.0)
    - Hosting
    - Authentication
    - Firestore

- **UI/UXコンポーネント**
  - Styled Components (6.1.17)
  - Framer Motion (12.6.5)
  - React Icons (5.5.0)

- **状態管理**
  - Redux Toolkit (2.7.0)
  - React Redux (9.2.0)

- **開発ツール**
  - TypeScript (5.7.2)
  - ESLint
  - Vitest (3.0.5)
  - Testing Library (16.2.0)
  - Terser (5.39.0)

- **CI/CD**
  - GitHub Actions
    - mainブランチへのプッシュ時に自動デプロイ
    - Firebase Hostingへの自動デプロイ
    - ビルドプロセスの自動化

※バージョンは開発時点のものです。

## 環境
https://memory-game-14283.web.app/ にアクセス

## 課題や今後の改善点
・パフォーマンス調整(全体、モバイル端末)  
　※PCでは比較的安定しているが、スマートフォンでは音抜けが発生する場合がある。  
・リファクタリング  

## 参照
音声素材　効果音ラボ(https://soundeffect-lab.info/sound/voice/)
