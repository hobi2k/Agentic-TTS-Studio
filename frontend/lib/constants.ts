export const DEFAULT_SYSTEM_HINT =
  "You are a production-minded TTS studio agent. Think in steps, keep the user informed, use tools when the user asks to speak, save, inspect local models, or prepare a long-form narration pipeline.";

export type StudioTab =
  | "home"
  | "orchestration"
  | "voices"
  | "gallery"
  | "tts"
  | "clone"
  | "design"
  | "effects"
  | "changer"
  | "separation"
  | "projects"
  | "story"
  | "dataset"
  | "training"
  | "voicebox";

export const PRODUCT_SECTIONS: Array<{
  title: string;
  items: Array<{ key: StudioTab; label: string; description: string }>;
}> = [
  {
    title: "Control",
    items: [
      {
        key: "home",
        label: "홈",
        description: "Qwen3-TTS-Demo 전체 기능의 진입점",
      },
      {
        key: "orchestration",
        label: "오케스트레이션 채팅",
        description: "여러 작업을 한 번에 지시하는 메인 에이전트 탭",
      },
      {
        key: "voices",
        label: "나의 목소리들",
        description: "저장된 프리셋과 런타임 상태 확인",
      },
      {
        key: "gallery",
        label: "생성 갤러리",
        description: "최근 생성 기록 검토",
      },
    ],
  },
  {
    title: "Generation",
    items: [
      {
        key: "tts",
        label: "텍스트 음성 변환",
        description: "기본 TTS 생성 요청을 준비",
      },
      {
        key: "clone",
        label: "목소리 복제",
        description: "참조 음성 기반 clone 흐름 설계",
      },
      {
        key: "design",
        label: "목소리 설계",
        description: "설명문 기반 voice design 흐름",
      },
      {
        key: "effects",
        label: "사운드 효과",
        description: "효과음 생성",
      },
      {
        key: "changer",
        label: "보이스 체인저",
        description: "업로드 음성 음색 변환",
      },
      {
        key: "separation",
        label: "오디오 분리",
        description: "harmonic/percussive 분리",
      },
      {
        key: "projects",
        label: "프리셋 기반 생성",
        description: "프리셋을 활용한 반복 생성",
      },
      {
        key: "story",
        label: "스토리 스튜디오",
        description: "장문 대본과 내레이션 분할 생성",
      },
    ],
  },
  {
    title: "Training",
    items: [
      {
        key: "dataset",
        label: "데이터셋 만들기",
        description: "학습용 샘플 정리와 준비 절차",
      },
      {
        key: "training",
        label: "학습 실행",
        description: "Qwen TTS 파인튜닝 운영 계획",
      },
      {
        key: "voicebox",
        label: "VoiceBox Lab",
        description: "self-contained VoiceBox 모델 흐름 관리",
      },
    ],
  },
];

export const TAB_DESCRIPTIONS: Record<StudioTab, string> = {
  home: "업데이트된 Qwen3-TTS-Demo 기능을 한 화면에서 훑어보고 바로 진입하는 탭입니다.",
  orchestration: "여러 기능 탭의 작업을 한 번에 묶어 순차 실행시키는 메인 컨트롤 센터입니다.",
  voices: "저장된 프리셋과 현재 로컬 모델 상태를 함께 보면서 다음 작업을 고르는 탭입니다.",
  gallery: "최근 생성 이력을 검토하고 다시 쓸 스타일이나 문장을 추려내는 탭입니다.",
  tts: "가장 기본적인 텍스트 음성 변환 요청을 준비하고 바로 실행합니다.",
  clone: "참조 음성 기반 목소리 복제 흐름을 설계하고 오케스트레이션에 연결합니다.",
  design: "설명문으로 새 목소리를 설계하고 샘플 생성까지 이어가는 탭입니다.",
  effects: "효과음 생성 프롬프트와 길이를 넣어 실제 오디오 파일을 만듭니다.",
  changer: "업로드한 오디오에 로컬 pitch shift 기반 보이스 체인저를 적용합니다.",
  separation: "업로드한 오디오를 harmonic/percussive 트랙으로 분리합니다.",
  projects: "프리셋을 기준으로 반복 생성하거나 새 문장을 읽히는 작업을 다룹니다.",
  story: "긴 대본을 분할하고 내레이션 스타일을 통일하는 장문 전용 탭입니다.",
  dataset: "데이터셋 구성, 전처리, 학습 전 체크리스트를 정리하는 탭입니다.",
  training: "Qwen TTS 학습 실행 전후의 운영 단계를 정리하고 실행 계획을 세우는 탭입니다.",
  voicebox: "CustomVoice와 Base speaker encoder를 합친 self-contained VoiceBox 워크플로를 정리하고 추론 후보를 보는 탭입니다.",
};

export const QUICK_ACTIONS: Array<{ label: string; tab: StudioTab }> = [
  { label: "기본 TTS 실행", tab: "tts" },
  { label: "목소리 설계", tab: "design" },
  { label: "사운드 효과", tab: "effects" },
  { label: "프리셋 생성", tab: "projects" },
  { label: "장문 내레이션", tab: "story" },
];
