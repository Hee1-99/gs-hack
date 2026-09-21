export type TrainingMode = 'practice' | 'test';
export type TrainingSource = { title: string; url: string };
export type TrainingStep = {
  id: string;
  chapter: string;
  kind?: 'choice' | 'short-answer';
  rubric?: { id: string; label: string; keywords: string[] }[];
  sampleAnswer?: string;
  title: string;
  situation: string;
  customer: string;
  /** Explicit scene roles; optional only for immutable version-1 records. */
  speakerLabel?: string;
  mission?: string;
  responseLabel?: string;
  answerPlaceholder?: string;
  question: string;
  choices: { id: string; label: string; detail?: string }[];
  correctChoiceId: string;
  explanation: string;
  source: TrainingSource;
  screen: 'handover' | 'scan' | 'promotion' | 'discount' | 'payment' | 'receipt' | 'hold' | 'complaint' | 'expiry' | 'waste' | 'report';
};

export const trainingTransaction = { productName: '캔커피 A', quantity: 3, unitPrice: 1500, discount: 1500 } as const;
export const trainingSubtotal = trainingTransaction.quantity * trainingTransaction.unitPrice;
export const trainingTotal = trainingSubtotal - trainingTransaction.discount;

// Only confirmed body summaries in docs/gs25-store-manager-training-map.md are used.
// Transactions, prices and screen graphics are synthetic practice fixtures.
export const legacyTrainingSteps: TrainingStep[] = [
  {
    id: 'handover', chapter: '근무 준비', title: '인수인계 확인', screen: 'handover',
    situation: '이전 근무자가 퇴근을 준비하고 있어요. 교대 전, 전달받을 내용을 확인해요.',
    customer: '오늘 입고된 상품과 아직 끝내지 못한 일이 있어요.', question: '근무를 시작하기 전에 무엇부터 할까요?',
    choices: [{ id: 'greet', label: '인사만 하고 바로 판매 시작' }, { id: 'check', label: '시재·처리할 상품·특이사항 함께 확인' }, { id: 'later', label: '다음 교대 때 한꺼번에 확인' }],
    correctChoiceId: 'check', explanation: '하루 업무 교육은 인수인계에서 시재, 처리할 상품, 특이사항을 확인하고 미완료 업무를 전달하도록 설명해요.',
    source: { title: 'GS25 하루', url: 'https://youtu.be/FWRQiAlhUKw' },
  },
  {
    id: 'cash-check', chapter: '근무 준비', title: '시재 차이 확인', screen: 'handover',
    situation: '연습용 점검표의 POS상 현금과 실제 확인한 금액이 다르게 표시됐어요.',
    customer: '점검표에 차이가 있네요. 같이 다시 확인해 볼까요?', question: '차이가 있을 때 알맞은 다음 행동은?',
    choices: [{ id: 'ignore', label: '차이를 무시하고 교대 완료' }, { id: 'guess', label: '확인 없이 이전 근무자의 실수로 기록' }, { id: 'compare', label: '전산·실물·점검표를 다시 대조하고 인계' }],
    correctChoiceId: 'compare', explanation: '시재점검은 POS상 현금과 실제 보관액, 점검표의 입력액과 차이를 대조하는 과정이에요. 확인 없이 차이의 원인을 단정하지 않아요.',
    source: { title: '인수인계(시재점검)', url: 'https://youtu.be/k4iXLelPA_c' },
  },
  {
    id: 'scan', chapter: 'POS 판매', title: '상품 등록', screen: 'scan',
    situation: `고객이 연습용 ${trainingTransaction.productName} ${trainingTransaction.quantity}개를 가져왔어요. 결제를 시작해요.`,
    customer: `이 커피 ${trainingTransaction.quantity}개 계산해 주세요.`, question: 'POS에서 먼저 할 일은?',
    choices: [{ id: 'card', label: '카드 결제부터 누르기' }, { id: 'scan', label: '상품 바코드 스캔', detail: '상품명과 수량을 화면에 등록해요' }, { id: 'memory', label: '기억나는 가격을 직접 입력' }],
    correctChoiceId: 'scan', explanation: '결제 교육은 상품을 먼저 스캔해 등록한 뒤 합계 금액을 안내하고 결제수단별 처리를 하도록 설명해요.',
    source: { title: '현금·카드·교통카드', url: 'https://youtu.be/rTkluVkkNc4' },
  },
  {
    id: 'promotion', chapter: 'POS 판매', title: '상품·행사 조회', screen: 'promotion',
    situation: '고객이 행사 적용 여부를 물어요. 가격표만 보고 결론을 내리지 말고 POS 기능을 골라요.',
    customer: '이 상품, 지금 행사 중인가요?', question: '어느 POS 기능으로 확인할까요?',
    choices: [{ id: 'receipt', label: '영수증 재출력' }, { id: 'lookup', label: '상품·행사 조회', detail: '등록된 상품과 행사 조건 확인' }, { id: 'assume', label: '조회 없이 행사라고 안내' }],
    correctChoiceId: 'lookup', explanation: 'POS 장비 교육은 상품 판매뿐 아니라 재고·행사 조회 기능을 소개해요. 이 연습에서는 상품 조회 화면을 확인한 뒤 고객에게 안내해요.',
    source: { title: 'POS 장비란?', url: 'https://youtu.be/5_7modVgpKk' },
  },
  {
    id: 'discount', chapter: 'POS 판매', title: '할인·적립 확인', screen: 'discount',
    situation: '상품이 등록됐어요. 고객에게 할인·적립 수단을 확인하고 화면의 반영 결과를 점검해요.',
    customer: '적립 바코드가 있어요. 지금 보여드릴까요?', question: '최종 결제 전에 어떤 순서로 처리할까요?',
    choices: [{ id: 'apply', label: '바코드 적용 후 화면 반영 확인' }, { id: 'after', label: '결제 완료 후 처음부터 확인' }, { id: 'say', label: '스캔하지 않고 적용됐다고 안내' }],
    correctChoiceId: 'apply', explanation: '상품 등록 후 할인·적립 수단을 확인하고 바코드 등으로 적용해요. 최종 결제 전에는 화면에 반영됐는지 확인해요.',
    source: { title: '할인·적립 방법', url: 'https://youtu.be/k7GLAXOOoGQ' },
  },
  {
    id: 'payment', chapter: 'POS 판매', title: '카드 결제 확인', screen: 'payment',
    situation: `화면의 연습용 합계는 ${trainingTotal.toLocaleString('ko-KR')}원이에요. 고객이 카드를 넣었고 승인 대기 화면이 보여요.`,
    customer: '카드 넣었어요. 이제 가져가도 되나요?', question: '카드 결제를 끝내기 위한 확인은?',
    choices: [{ id: 'remove', label: '카드를 넣었으니 바로 완료 처리' }, { id: 'approve', label: 'POS 결제 완료 결과 확인', detail: '승인 상태를 확인한 뒤 안내해요' }, { id: 'cash', label: '확인 없이 현금 결제로 변경' }],
    correctChoiceId: 'approve', explanation: '카드·교통카드 결제는 해당 결제 화면의 완료 결과까지 확인해요. 카드를 넣은 행동만으로 완료됐다고 판단하지 않아요.',
    source: { title: '현금·카드·교통카드', url: 'https://youtu.be/rTkluVkkNc4' },
  },
  {
    id: 'receipt', chapter: 'POS 판매', title: '영수증 출력 점검', screen: 'receipt',
    situation: '영수증 용지가 떨어져 새 감열지로 교체했어요. 정상 작동 여부를 확인해요.',
    customer: '영수증도 부탁드려요.', question: '감열지를 교체한 다음 할 일은?',
    choices: [{ id: 'finish', label: '덮개를 닫았으니 점검 끝내기' }, { id: 'photo', label: '빈 종이를 고객에게 전달' }, { id: 'print', label: '영수증 다시 출력 후 인쇄 확인' }],
    correctChoiceId: 'print', explanation: '감열지를 올바른 방향으로 넣고 교체한 뒤, 영수증을 다시 출력해 정상 인쇄 여부를 확인해요.',
    source: { title: 'POS 감열지 교체 방법', url: 'https://youtu.be/9_mnCmrMKDs' },
  },
  {
    id: 'hold', chapter: 'POS 판매', title: '판매 보류', screen: 'hold',
    situation: '다음 고객이 상품 등록 후 지갑을 찾으러 갔어요. 뒤에는 다른 고객이 기다려요.',
    customer: '잠깐만요, 지갑을 두고 왔어요. 금방 돌아올게요.', question: '등록한 상품을 유지하며 다음 고객을 받으려면?',
    choices: [{ id: 'hold', label: '판매 보류 후 다음 고객 처리', detail: '돌아오면 보류 목록을 불러와요' }, { id: 'mix', label: '다음 고객 상품을 같은 목록에 추가' }, { id: 'paid', label: '결제되지 않았지만 결제 완료 처리' }],
    correctChoiceId: 'hold', explanation: '판매 보류는 결제 전 상품 목록을 잠시 보관하는 기능이에요. 다른 고객을 처리한 뒤 기존 목록을 불러와 이어서 결제해요.',
    source: { title: '판매 보류', url: 'https://youtu.be/4SC8wTvBYaU' },
  },
  {
    id: 'complaint', chapter: '문제 해결', title: '고객 불만 듣기', screen: 'complaint',
    situation: '고객이 구매한 상품에 문제가 있다며 다시 찾아왔어요.',
    customer: '아까 산 상품에 문제가 있어요. 너무 불편하네요.', question: '처음 고객에게 보일 행동은?',
    choices: [{ id: 'deny', label: '내용을 듣기 전에 매장 책임이 아니라고 안내' }, { id: 'listen', label: '끝까지 듣고 불편에 공감하며 사실 확인' }, { id: 'promise', label: '확인 전 모든 보상을 확정해 약속' }],
    correctChoiceId: 'listen', explanation: 'VOC 기본 응대는 경청, 사과·공감, 문제 해결, 재차 사과·감사의 흐름이에요. 즉시 해결하기 어렵다면 후속 대응을 안내해요.',
    source: { title: '불만 VOC 응대', url: 'https://www.youtube.com/watch?v=W9bqatN_WH0' },
  },
  {
    id: 'expiry', chapter: '문제 해결', title: '소비기한 상황 확인', screen: 'expiry',
    situation: '고객이 상품의 소비기한에 문제가 있다고 설명해요. 필요한 정보를 구분해 확인해요.',
    customer: '이 상품 날짜를 봐 주세요. 일부 먹었는데 걱정돼요.', question: '확인해야 할 내용을 골라 주세요.',
    choices: [{ id: 'only-date', label: '상품 날짜만 확인하고 대화 종료' }, { id: 'diagnose', label: '몸에 문제가 없을 것이라고 단정' }, { id: 'facts', label: '상품·구매 상황·섭취 여부·건강 이상 여부' }],
    correctChoiceId: 'facts', explanation: '소비기한 VOC 교육은 상품과 구매 상황, 섭취 여부, 건강 이상 여부를 구분해 확인해요. 보상이나 건강 상태를 임의로 확정하지 않고 현행 지침과 경영주 확인으로 연결해요.',
    source: { title: '소비기한 VOC 응대', url: 'https://youtu.be/paDpMGToDS4' },
  },
  {
    id: 'waste', chapter: '문제 해결', title: '폐기 상품 등록', screen: 'waste',
    situation: '매대 점검 중 판매하지 않을 연습용 상품 2개를 찾았어요.',
    customer: '판매할 상품과 섞이지 않도록 따로 관리해 주세요.', question: '폐기등록의 알맞은 처리 순서는?',
    choices: [{ id: 'register', label: '스캔 → 수량 입력·대조 → 판매 재고와 분리' }, { id: 'shelf', label: '등록만 하고 판매 매대에 그대로 두기' }, { id: 'guess', label: '상품 확인 없이 대략적인 수량 입력' }],
    correctChoiceId: 'register', explanation: '판매하지 않을 상품을 스캔해 폐기 수량을 입력하고 실제 수량과 다시 대조해요. 등록한 상품은 판매 재고와 분리해 관리해요.',
    source: { title: '폐기등록', url: 'https://youtu.be/598UOsIWa7Y' },
  },
  {
    id: 'report', chapter: '문제 해결', title: '다음 근무자에게 전달', screen: 'report',
    situation: '교대 시간이 됐어요. 아직 답을 받지 못한 고객 문의와 미완료 업무가 있어요.',
    customer: '확인이 끝나면 다음 근무자가 이어서 처리할 수 있게 남겨 주세요.', question: '근무를 마칠 때 어떤 내용을 전달할까요?',
    choices: [{ id: 'none', label: '끝내지 못한 일이니 전달하지 않기' }, { id: 'handover', label: '미완료 업무·특이사항·후속 확인 내용을 전달' }, { id: 'done', label: '확인 전이라도 모두 완료로 표시' }],
    correctChoiceId: 'handover', explanation: '하루 업무 교육은 시간대별 업무를 연결하고, 미완료 업무와 특이사항을 다음 근무자에게 전달하는 흐름을 설명해요.',
    source: { title: 'GS25 하루', url: 'https://youtu.be/FWRQiAlhUKw' },
  },
];

export const trainingChapters = ['근무 준비', '상품 관리', 'POS 판매', '결제·서비스', '위생·안전', '고객 응대'] as const;
function base(id: string, chapter: string): TrainingStep { return { ...legacyTrainingSteps.find(step => step.id === id)!, chapter, kind: 'choice' }; }
function choice(id: string, chapter: string, title: string, situation: string, question: string, labels: [string,string,string], explanation: string, sourceTitle: string, video: string, screen: TrainingStep['screen'] = 'report'): TrainingStep {
  const choices = labels.map((label,index) => ({ id: index === 0 ? 'correct' : `other-${index}`, label }));
  const offset = id.length % 3;
  return { id,chapter,title,situation,question,customer:situation,choices:[...choices.slice(offset),...choices.slice(0,offset)],correctChoiceId:'correct',explanation,source:{title:sourceTitle,url:`https://youtu.be/${video}`},screen,kind:'choice' };
}
function written(id: string, title: string, situation: string, source: TrainingSource, explanation: string, rubric: NonNullable<TrainingStep['rubric']>, sampleAnswer: string, chapter = '고객 응대'): TrainingStep {
  return {id,title,chapter,situation,customer:situation,question:'고객이나 다음 근무자에게 어떻게 설명할까요?',choices:[],correctChoiceId:'written',explanation,source,screen:'complaint',kind:'short-answer',rubric,sampleAnswer};
}

// Scene copy is synthetic. Actions and answer rubrics remain within each cited summary.
// Keep this separate from legacyTrainingSteps so historical version-1 content never changes.
const sceneContext: Record<string, Pick<TrainingStep, 'speakerLabel' | 'mission' | 'customer'> & Partial<TrainingStep>> = {
  handover: { speakerLabel:'이전 근무자', customer:'오늘 입고된 상품과 아직 끝내지 못한 일이 있어요.', mission:'이전 근무자와 교대할 때 함께 확인할 항목을 고르세요.' },
  'cash-check': { speakerLabel:'이전 근무자', customer:'POS에 나온 현금과 실제 보관액이 다르네요.', mission:'차이의 원인을 단정하기 전에 다시 확인할 행동을 고르세요.' },
  'scanner-ready': { speakerLabel:'업무 안내', customer:'입고 검수에 사용할 S/T와 블루투스 스캐너가 준비되어 있어요.', mission:'상품을 검수하기 전에 스캐너를 준비하는 행동을 고르세요.' },
  receiving: { speakerLabel:'업무 안내', customer:'출하 목록의 수량과 도착한 상품 수량이 일치하지 않아요.', mission:'검수를 완료하기 전에 수량 차이를 확인할 방법을 고르세요.' },
  'reserved-stock': { speakerLabel:'업무 안내', customer:'이 상품에는 고객 사전예약 표시가 있어요.', mission:'예약 고객이 수령하기 전까지 상품을 보관할 방법을 고르세요.' },
  'handover-note': {
    speakerLabel:'다음 근무자', customer:'입고 검수는 어디까지 했나요? 제가 이어서 확인할 일이 있나요?', screen:'report',
    mission:'다음 근무자에게 입고 수량 차이와 재확인할 일을 전달하세요.',
    question:'아직 끝나지 않은 검수와 다음 확인 행동을 어떻게 전달할까요?',
    responseLabel:'다음 근무자에게 전달할 내용', answerPlaceholder:'확인이 끝나지 않은 내용과 이어서 확인할 일을 적어 주세요.',
    sampleAnswer:'입고 수량에 차이가 있어 검수를 아직 완료하지 못했습니다. 전산 출하 수량과 실제 상품 수량을 다시 대조해 주시고, 확인 결과를 전달해 주세요.',
    rubric:[{id:'unfinished',label:'입고 검수가 아직 끝나지 않았음을 명확히 전달',keywords:['미완료','아직','확인 중']},{id:'detail',label:'입고 수량에 차이가 있다는 구체적인 상황 전달',keywords:['수량','차이','입고']},{id:'next',label:'전산과 실물 수량을 다시 대조하는 등 다음 확인 행동 요청',keywords:['다시','재확인','대조','이어']}],
  },
  'expiry-register': { speakerLabel:'업무 안내', customer:'상품별 소비기한과 수량을 입력할 수 있는 등록 화면이에요.', mission:'소비기한 정보를 저장한 뒤 누락을 확인하는 행동을 고르세요.' },
  'display-fifo': { speakerLabel:'업무 안내', customer:'같은 상품의 기존 재고와 새 입고분이 함께 있어요.', mission:'기존 재고가 먼저 판매되도록 진열하는 방법을 고르세요.' },
  'price-label': { speakerLabel:'업무 안내', customer:'스캔한 상품이 가격표 인쇄 목록에 추가됐어요.', mission:'가격표를 인쇄하기 전에 목록에서 확인할 내용을 고르세요.' },
  waste: { speakerLabel:'업무 안내', customer:'폐기로 분류한 연습용 상품 2개가 있어요.', situation:'매대 점검 중 폐기 대상으로 확인한 연습용 상품 2개를 찾았어요.', mission:'상품과 수량을 확인해 폐기등록하고 판매 재고와 분리하는 흐름을 고르세요.' },
  'equipment-temperature': { speakerLabel:'업무 안내', customer:'냉장 설비 안에 상품이 많이 쌓여 있어요.', situation:'냉장 설비 안에 상품이 과하게 적재되어 있어요. 온도 표시와 보관 상태를 점검하려고 해요.', mission:'설비 종류에 맞춰 온도와 적재 상태를 확인하는 행동을 고르세요.' },
  'stock-difference': { speakerLabel:'업무 안내', customer:'담배 재고 조사표와 실제 상품 수량에 차이가 있어요.', title:'담배 전산·실물 재고 대조', situation:'담배 재고를 조사하던 중 전산 수량과 실물 수량이 다르게 나왔어요.', mission:'차이가 있는 담배 상품과 수량을 확인한 뒤 전달할 내용을 고르세요.' },
  scan: { speakerLabel:'고객', customer:`이 커피 ${trainingTransaction.quantity}개 계산해 주세요.`, mission:'결제할 상품을 POS에 먼저 등록하세요.' },
  promotion: { speakerLabel:'고객', customer:'이 상품, 지금 행사 중인가요?', mission:'고객에게 행사 여부를 안내하기 위해 POS에서 조회할 기능을 고르세요.' },
  discount: { speakerLabel:'고객', customer:'적립 바코드가 있어요. 지금 보여드릴까요?', mission:'최종 결제 전에 할인·적립 반영 여부를 확인하세요.' },
  payment: { speakerLabel:'고객', customer:'카드 넣었어요. 이제 가져가도 되나요?', mission:'상품을 전달하기 전에 POS에서 카드 결제 결과를 확인하세요.' },
  receipt: { speakerLabel:'고객', customer:'영수증도 부탁드려요.', mission:'감열지를 교체한 프린터에서 정상 인쇄 여부를 확인하세요.' },
  hold: { speakerLabel:'고객', customer:'잠깐만요, 지갑을 두고 왔어요. 금방 돌아올게요.', mission:'이 고객의 상품 목록을 유지하면서 다음 고객의 결제를 준비하세요.' },
  'mobile-coupon': { speakerLabel:'고객', customer:'이 상품 모바일 교환권으로 계산할게요.', mission:'상품을 등록하고 교환권과 실제 상품의 일치 여부를 확인하세요.' },
  'split-payment': { speakerLabel:'고객', customer:'일부는 결제했어요. 나머지는 다른 수단으로 낼게요.', mission:'다음 결제수단에 입력하기 전에 남은 금액을 확인하세요.' },
  'return-original': { speakerLabel:'고객', customer:'구매한 이 상품을 반품하고 싶어요.', mission:'반품 가능 여부와 처리를 확인할 원래 거래부터 찾으세요.' },
  'cash-receipt': { speakerLabel:'고객', customer:'현금영수증도 발행해 주세요.', mission:'현금영수증의 용도와 고객 입력 방법을 안내하세요.' },
  'parcel-accept': { speakerLabel:'업무 안내', customer:'일반택배와 반값택배 접수 물품이 각각 도착했어요.', mission:'접수 정보와 운송장을 확인한 뒤 종류별 보관 흐름을 고르세요.' },
  'parcel-pickup': { speakerLabel:'고객', customer:'제 앞으로 도착한 택배를 찾으러 왔어요.', mission:'택배를 건네기 전에 고객의 수령 정보와 실물을 대조하세요.' },
  'ff-hygiene': { speakerLabel:'업무 안내', customer:'카운터 조리에 사용할 재료와 도구가 준비되어 있어요.', mission:'조리를 시작하기 전에 손 위생과 재료 상태를 확인하세요.' },
  'ff-label': { speakerLabel:'업무 안내', customer:'조리가 끝난 상품의 상미시간 표지를 발행해야 해요.', mission:'표지에 사용할 상품 정보와 제조 정보를 확인하세요.' },
  'coffee-clean': { speakerLabel:'기기 안내', customer:'커피 기기 화면에 세척 알림이 표시됐어요.', mission:'현재 기종의 지침에 맞춰 세척·관리할 행동을 고르세요.' },
  'hotpot-clean': { speakerLabel:'업무 안내', customer:'사용을 마친 어묵기가 아직 뜨거워요.', title:'어묵기 세척 준비', situation:'사용을 마친 어묵기를 세척하려고 해요. 용기와 본체에 열이 남아 있어요.', mission:'세척을 시작하기 전에 어묵기를 안전하게 준비하는 행동을 고르세요.', explanation:'어묵기 교육은 전원을 차단하고 충분히 식힌 뒤 세척하도록 설명해요. 본체에 직접 물을 뿌리거나 빈 용기를 가열하지 않아요. 실제 조작은 해당 기기의 지침을 확인해요.' },
  'extinguisher-check': { speakerLabel:'업무 안내', customer:'상자가 소화기를 꺼내는 길을 막고 있어요.', mission:'소화기를 쉽게 꺼낼 수 있게 하고 평소 확인할 상태를 고르세요.' },
  'emergency-call': { speakerLabel:'상황 안내', customer:'매장 안에 쓰러진 사람을 발견했어요.', mission:'현장 안전과 반응을 확인한 뒤 도움을 요청하는 행동을 고르세요.', question:'응급 상황을 발견했을 때 우선할 행동은?' },
  complaint: { speakerLabel:'고객', customer:'아까 산 상품에 문제가 있어요. 너무 불편하네요.', mission:'고객의 불만을 처음 들었을 때 적절한 응대 행동을 고르세요.' },
  expiry: { speakerLabel:'고객', customer:'이 상품 날짜를 봐 주세요. 일부 먹었는데 걱정돼요.', mission:'건강 상태나 보상을 단정하기 전에 확인할 사실을 고르세요.' },
  'complaint-reply': {
    speakerLabel:'고객', situation:'고객이 조금 전 구매한 상품에 문제가 있다며 돌아왔어요. 어떤 문제인지는 아직 확인하지 못했어요.', customer:'아까 산 상품 때문에 불편했어요. 어떻게 해 주실 건가요?',
    mission:'고객의 불편에 공감하고, 사실 확인과 후속 대응을 설명하세요.', question:'이 고객에게 처음 어떻게 답할까요?',
    responseLabel:'고객에게 할 말', answerPlaceholder:'불편에 대한 응대, 확인할 사실, 이어서 할 조치를 적어 주세요.',
    rubric:[{id:'empathy',label:'고객의 불편을 인정하며 사과하거나 공감',keywords:['죄송','불편','공감']},{id:'facts',label:'문제가 된 상품과 구매 상황을 질문하거나 확인하겠다고 안내',keywords:['확인','상품','상황']},{id:'followup',label:'확인 가능한 조치나 경영주 확인 등 구체적인 후속 대응 안내; 확인 전 보상 확정 금지',keywords:['안내','경영주','조치','다시']}],
  },
  'expiry-reply': {
    speakerLabel:'고객', situation:'고객이 소비기한이 의심되는 상품을 가져왔어요. 일부 섭취했다고 하지만 건강 이상 여부와 구매 상황은 아직 확인하지 못했어요.', customer:'이 상품 날짜가 이상해요. 조금 먹었는데 괜찮은 건가요?',
    mission:'상품·구매 상황과 섭취·건강 이상 여부를 확인하고 후속 대응을 안내하세요.', question:'건강 상태를 단정하지 않고 이 고객에게 어떻게 답할까요?',
    responseLabel:'고객에게 할 말', answerPlaceholder:'상품·구매 및 섭취 상황을 확인하는 말과 후속 안내를 적어 주세요.',
    rubric:[{id:'facts',label:'문제가 된 상품과 구매 상황을 확인',keywords:['상품','구매','날짜']},{id:'health',label:'섭취 상황과 현재 건강 이상 여부를 각각 확인; 건강에 문제가 없다고 단정하지 않음',keywords:['드셨','섭취','이상','불편한']},{id:'escalate',label:'경영주 확인 등 후속 대응을 안내하며 확인 전 보상이나 건강 상태를 확정하지 않음',keywords:['경영주','확인한 뒤','단정','안내']}],
  },
  'pickup-reply': {
    speakerLabel:'고객', situation:'고객이 보관 중인 택배를 찾으러 왔어요. 수령에 필요한 QR이 보이지 않아 확인이 끝나지 않은 상태예요.', customer:'택배를 찾으러 왔는데 QR이 안 보여요. 그냥 제 상자 주세요.',
    mission:'수령 정보를 확인할 방법과 확인 후 택배를 전달한다는 점을 설명하세요.', question:'QR이 보이지 않는 고객에게 어떤 확인 절차를 안내할까요?',
    responseLabel:'고객에게 할 말', answerPlaceholder:'수령 정보 대조, QR 재발송 요청, 전달 시점을 설명해 주세요.',
    rubric:[{id:'match',label:'송장·주문번호 등 수령 정보와 보관 실물을 대조한다고 안내',keywords:['주문번호','송장','실물']},{id:'resend',label:'보이지 않는 QR을 재발송받도록 요청하거나 추가 확인을 요청',keywords:['재발송','다시','확인 요청']},{id:'wait',label:'확인이 끝난 뒤 전달한다고 안내; 확인 전 임의 전달 금지',keywords:['확인 후','확인되면','확인한 뒤','확인된 뒤']}],
  },
  report: {
    speakerLabel:'다음 근무자', customer:'교대하러 왔어요. 아직 남아 있는 일과 제가 이어서 할 일을 알려 주세요.', screen:'report',
    mission:'다음 근무자에게 고객 문의의 답변 대기 상태와 남은 상품 정리를 전달하세요.', question:'남아 있는 두 가지 업무와 다음 행동을 어떻게 인계할까요?',
    responseLabel:'다음 근무자에게 전달할 내용', answerPlaceholder:'고객 문의의 현재 상태, 남은 상품 정리, 이어서 할 일을 적어 주세요.',
    rubric:[{id:'pending',label:'고객 문의가 경영주 답변을 기다리는 미완료 상태임을 전달',keywords:['대기','아직','미완료','기다리']},{id:'tasks',label:'고객 문의와 남아 있는 상품 정리 두 가지 업무를 모두 전달',keywords:['상품','고객','문의']},{id:'next',label:'답변 확인·고객 안내와 상품 정리를 이어서 요청',keywords:['확인','전달','이어']}],
  },
};

export const trainingSteps: TrainingStep[] = [
  base('handover','근무 준비'), base('cash-check','근무 준비'),
  choice('scanner-ready','근무 준비','S/T 스캐너 준비','입고 상품을 검수하기 전 스캐너를 준비해요.','스캐너를 사용하기 전 확인할 것은?', ['기기 연결을 확인하고 상품 바코드 스캔','연결 확인 없이 임의 수량 입력','상품명만 보고 검수 완료'], 'S/T는 바코드 스캔으로 검수·선도관리·상품 조회를 도와요. 휴대전화와 블루투스 스캐너의 준비·연결 상태부터 확인해요.','S/T 사용하기','KuikCHbuE6g'),
  choice('receiving','근무 준비','입고 수량 검수','전산 출하 수량과 실제 도착 수량이 달라 보여요.','검수를 마치기 전 어떤 확인이 필요할까요?', ['발주·출하·실물 수량을 대조하고 차이 재확인','전산 수량이 항상 맞으니 그대로 완료','도착한 상자 수만 세고 완료'], '발주·출하 수량과 실제 입고 수량을 대조해요. 미입고나 차이는 재확인 후 사유를 등록하고 미검수 목록도 확인해요.','상품 검수','frVZswofdA0'),
  choice('reserved-stock','근무 준비','사전예약 상품 보관','사전예약 표시가 있는 상품이 일반 상품과 함께 입고됐어요.','이 상품은 어떻게 보관할까요?', ['일반 판매 재고와 분리해 예약 수령까지 보관','일반 매대에 진열해 먼저 온 고객에게 판매','예약 여부 확인 없이 폐기'], '예약 상품은 일반 판매 재고와 분리해 보관해요. 고객의 QR과 상품을 대조한 뒤 전달해요.','사전예약','Ut0JWdGw8QQ'),
  written('handover-note','미완료 업무 전달','다음 근무자가 왔어요. 입고 수량 차이를 재확인 중이고 아직 결과가 없어요.', {title:'GS25 하루',url:'https://youtu.be/FWRQiAlhUKw'},'미완료 업무와 특이사항을 구체적으로 남기고 다음 확인 행동을 전달해요.',[{id:'unfinished',label:'미완료 상태를 명확히 전달',keywords:['미완료','아직','확인 중']},{id:'detail',label:'수량 차이와 확인할 내용을 전달',keywords:['수량','차이','입고']},{id:'next',label:'후속 확인과 인계를 요청',keywords:['다시 확인','재확인','이어','전달']}],'입고 수량에 차이가 있어 아직 확인 중입니다. 전산과 실물을 다시 확인해 주시고 결과를 다음 근무자에게 전달해 주세요.','근무 준비'),

  choice('expiry-register','상품 관리','소비기한 등록','새 상품의 소비기한을 관리 목록에 등록해요.','등록 후 누락을 막으려면?', ['상품별 날짜·수량을 저장하고 조회 목록 확인','날짜만 기억하고 등록하지 않기','모든 상품을 같은 날짜로 등록'], '소비기한 캘린더와 S/T로 상품별 날짜·수량을 등록해요. 조회 목록에서 누락을 점검하고 잘못된 수량은 수정·저장해요.','상품·선도관리 등록','ZUdZh4j1YO0'),
  choice('display-fifo','상품 관리','선입선출 진열','같은 상품의 기존 재고와 새 입고분을 진열해요.','올바른 진열은?', ['먼저 입고된 상품부터 판매되도록 배치','새로 들어온 상품만 앞쪽에 배치','가격표와 다른 위치에 임시로 적재'], '상품 정면과 상표가 보이게 정돈하고 먼저 입고된 상품이 먼저 판매되도록 배치해요. 가격표와 상품 위치도 맞춰요.','기본 진열 방법','hodvRGfWG24'),
  choice('price-label','상품 관리','가격표 목록 확인','가격표가 없는 상품을 스캔했어요.','인쇄하기 전에 무엇을 확인할까요?', ['인쇄 목록의 상품이 실제 상품과 일치하는지','비슷한 이름이면 바로 인쇄','가격표 없이 상품만 진열'], '스마트 스캔으로 상품을 읽고 인쇄 목록에 등록한 뒤, 정확한 상품이 들어갔는지 확인해요.','가격표 발행(S/T)','seHSn7jo1mE'),
  base('waste','상품 관리'),
  choice('equipment-temperature','상품 관리','냉장·냉동 설비 점검','냉장고 앞에 상품이 과하게 쌓여 있어요.','어떤 점검을 할까요?', ['설비 종류·온도 표시·과다 적재·성에 확인','모든 기기에 같은 온도 기준 임의 적용','표시를 확인하지 않고 전원만 반복 조작'], '냉장·냉동 설비를 구분해 온도와 적재·성에를 확인해요. 구체적 온도와 주기는 해당 설비의 최신 지침을 확인해요.','기기별 적정온도 관리','kXq0_zT_W74'),
  choice('stock-difference','상품 관리','전산·실물 재고 대조','재고 조사 중 전산 수량과 실물 수량이 달라요.','차이가 있는 상품은 어떻게 할까요?', ['상품·차이 수량을 기록해 경영주와 다음 근무자에게 전달','원인을 확인하지 않고 임의 수량으로 맞추기','차이가 작으면 기록하지 않기'], '전산 수량과 실물을 대조하고 차이가 있는 상품과 수량을 따로 기록해 경영주와 다음 근무자에게 전달해요.','담배 수불 방법','P0sFEaePdmc'),

  ...['scan','promotion','discount','payment','receipt','hold'].map(id => base(id,'POS 판매')),

  choice('mobile-coupon','결제·서비스','모바일 교환권 확인','고객이 모바일 교환권을 보여 줬어요.','어떤 순서로 처리할까요?', ['상품 등록 후 교환권 바코드와 상품 일치 확인','교환권 그림만 보고 다른 상품으로 교환','상품 등록 없이 결제 완료'], '상품을 먼저 등록한 뒤 상품권·기프티콘 바코드를 스캔해요. 교환권과 상품의 일치 여부를 구분해 확인해요.','모바일 상품권·기프티콘','0qog_xAYzms','payment'),
  choice('split-payment','결제·서비스','복합결제 잔액 확인','고객이 일부 금액을 먼저 결제했어요.','다음 수단으로 결제하기 전 할 일은?', ['이미 결제된 금액과 남은 금액 확인','전체 금액을 다음 수단으로 다시 결제','일부만 결제됐어도 완료로 표시'], '일부 금액을 결제한 뒤 남은 금액을 확인하고 다음 결제수단으로 이어가요.','결제 메뉴(복합결제)','eYVfoqL5KkI','payment'),
  choice('return-original','결제·서비스','반품 원거래 확인','고객이 구매 상품의 반품을 요청했어요.','반품 처리 전에 무엇부터 확인할까요?', ['영수증 또는 거래 조건으로 원거래와 결제수단 확인','상품 가격만 보고 임의 환불','원래 수단과 무관하게 새 거래 생성'], '영수증이나 날짜·상품·금액 조건으로 원거래를 찾고 원래 결제 내역과 수단을 먼저 확인해요. 실제 가능 여부는 최신 지침에 따라 확인해요.','반품(현금·카드·교통카드)','pM-1mfbZPL8','receipt'),
  choice('cash-receipt','결제·서비스','현금영수증 안내','고객이 현금영수증 발행을 요청해요.','필요한 안내는?', ['개인용·사업자용을 확인하고 고객이 직접 입력하도록 안내','직원 개인 번호로 대신 발행','사용 목적을 묻지 않고 임의 발급'], '개인용·사업자용을 확인하고 고객이 직접 입력할 수 있는 방식으로 발급해요. 결제 후 발행은 원거래를 먼저 찾아요.','현금영수증 발행','fNfpozUpeos','receipt'),
  choice('parcel-accept','결제·서비스','택배 접수·보관','접수할 택배의 서비스 종류가 서로 달라요.','접수 이후 어떤 흐름으로 처리할까요?', ['접수 정보·무게·운송장을 확인하고 종류별 분리 보관','운송장 없이 모든 물품을 한곳에 쌓기','서비스 종류를 확인하지 않고 임의 결제'], '서비스 종류와 접수 정보·무게를 확인하고 운송장을 부착해요. 결제·안내를 거쳐 서비스 종류별로 물품을 분리 보관해요.','일반·반값택배','5nYtL3JYacw'),
  choice('parcel-pickup','결제·서비스','택배 픽업 대조','고객이 보관 중인 택배를 찾으러 왔어요.','전달 전에 무엇을 대조할까요?', ['송장·주문번호와 보관된 실물','상자 크기와 고객의 인상','방문 순서와 선반 위치만'], '고객의 송장·주문번호를 실물과 대조한 뒤 전달 처리해요. QR 확인이 어렵거나 등록 불가인 경우에는 재발송·확인을 요청해요.','택배 픽업','ncXixYAv-G8'),

  choice('ff-hygiene','위생·안전','조리 전 위생','카운터 조리를 시작하려고 해요.','조리 전에 확인할 것은?', ['손 위생과 재료 보관·밀봉 상태','손 위생은 마감 때 한 번만','재료 상태와 관계없이 바로 조리'], '카운터 FF 업무는 청결·위생이 기본이에요. 조리 전 손 위생, 재료 보관·밀봉 상태를 확인해요.','카운터 FF 관리 업무','Oiy7JOFhNHM'),
  choice('ff-label','위생·안전','조리 후 표시 발행','카운터 상품의 조리가 끝났어요.','상미시간 표지를 발행할 때 확인할 것은?', ['상품 바코드·상품명·제조 일시·수량','어제 발행한 표지를 그대로 재사용','상품명 없이 시간만 추정해 기록'], '조리 후 상품 바코드·상품명·제조 일시·수량을 확인해 표지를 발행하고 해당 상품 근처에서 볼 수 있게 관리해요.','카운터 FF 상미시간 발행','KfZAtUfWVg8'),
  choice('coffee-clean','위생·안전','커피 기기 관리','커피 기기에 세척 알림이 표시됐어요.','어떻게 확인할까요?', ['기종별 지침에 따라 추출구·찌꺼기통·센서 등 관리','알림을 무시하고 계속 판매','다른 기종의 절차와 주기를 그대로 적용'], '원두 호퍼·추출구·찌꺼기통·센서 등을 관리해요. 세척 순서와 주기는 기종별 제조사·점포 지침으로 확인해요.','CAFE25 관리 방법','NWunUKptUzo'),
  choice('hotpot-clean','위생·안전','열탕기 세척 준비','열탕기 세척을 준비하고 있어요.','안전한 세척 준비는?', ['전원을 차단하고 충분히 식힌 뒤 세척','뜨거운 상태에서 본체에 직접 물 분사','빈 용기를 가열하며 청소'], '열탕기는 전원을 차단하고 충분히 식힌 뒤 세척해요. 본체에 직접 물을 뿌리거나 빈 용기를 가열하지 않아요.','어묵기','16s4hws_HAs'),
  choice('extinguisher-check','위생·안전','소화기 접근·상태 점검','소화기 앞에 상자가 놓여 있어요.','평소 점검에서 필요한 행동은?', ['쉽게 꺼낼 수 있게 확보하고 게이지·기간·안전핀 확인','상자로 가려도 위치만 알면 그대로 두기','안전핀을 제거한 상태로 보관'], '소화기를 쉽게 찾고 꺼낼 수 있도록 배치하고 압력 게이지·사용 기간·안전핀을 점검해요. 실제 화재 대응은 최신 공식 안전교육을 따라요.','소화기 관리 방법','znDhAsPa-bA'),
  choice('emergency-call','위생·안전','응급 상황 도움 요청','매장에 쓰러진 사람이 있어요.','앱의 퀴즈보다 우선해야 할 대응은?', ['현장 안전·반응 확인 후 119와 주변 도움 요청','혼자 해결하려고 신고를 미루기','앱에서 진단 결과가 나올 때까지 기다리기'], '현장 안전과 반응을 확인하고 119 신고와 도움을 요청해요. 처치 수치나 동작을 이 앱으로 대신 배우지 말고 신고 상담원과 최신 공식 교육을 따라요.','심폐소생술','v0NU4mvZ_Xw'),

  base('complaint','고객 응대'),base('expiry','고객 응대'),
  written('complaint-reply','불만 고객에게 답하기','아까 산 상품 때문에 불편했어요. 어떻게 해 주실 건가요?', {title:'불만 VOC 응대',url:'https://youtu.be/W9bqatN_WH0'},'경청과 사과·공감 후 사실을 확인하고 확인 가능한 조치 또는 후속 대응을 안내해요.',[{id:'empathy',label:'불편에 대한 사과·공감',keywords:['죄송','불편','공감']},{id:'facts',label:'상황과 상품 사실 확인',keywords:['확인','상품','상황']},{id:'followup',label:'해결 또는 후속 확인 안내',keywords:['안내','경영주','조치','다시']}],'불편을 드려 죄송합니다. 상품과 구매 상황을 먼저 확인하겠습니다. 바로 해결하기 어려우면 경영주에게 확인한 뒤 가능한 조치를 안내해 드리겠습니다.'),
  written('expiry-reply','섭취한 상품 문의에 답하기','이 상품 날짜가 이상해요. 조금 먹었는데 괜찮은 건가요?', {title:'소비기한 VOC 응대',url:'https://youtu.be/paDpMGToDS4'},'상품·구매 상황과 섭취·건강 이상 여부를 구분해 확인해요. 건강 상태나 보상을 단정하지 않아요.',[{id:'facts',label:'상품·구매 상황 확인',keywords:['상품','구매','날짜']},{id:'health',label:'섭취·건강 이상 여부 확인',keywords:['드셨','섭취','이상','불편한']},{id:'escalate',label:'확인 후 후속 대응 안내',keywords:['경영주','확인한 뒤','단정','안내']}],'걱정되셨겠어요. 상품과 구매 날짜, 얼마나 드셨는지, 몸에 이상은 없는지 확인하겠습니다. 건강 상태를 단정하지 않고 경영주에게 확인한 뒤 후속 대응을 안내하겠습니다.'),
  written('pickup-reply','QR 확인이 어려울 때','택배를 찾으러 왔는데 QR이 안 보여요. 그냥 제 상자 주세요.', {title:'택배 픽업',url:'https://youtu.be/ncXixYAv-G8'},'송장·주문번호와 실물을 확인하고 QR 확인이 어려우면 재발송 또는 확인을 요청해요. 확인 전에 임의 전달하지 않아요.',[{id:'match',label:'주문번호·송장과 실물 대조',keywords:['주문번호','송장','실물']},{id:'resend',label:'재발송 또는 추가 확인 요청',keywords:['재발송','다시','확인 요청']},{id:'wait',label:'확인 후 전달 안내',keywords:['확인 후','확인되면','확인한 뒤','확인된 뒤']}],'주문번호나 송장을 실물과 먼저 대조하겠습니다. QR 재발송을 요청해 주시고 확인된 뒤 전달해 드리겠습니다.'),
  written('report','다음 근무자에게 전달','교대 시간이에요. 고객 문의는 경영주 답변을 기다리고 있고 정리할 상품도 남아 있어요.', {title:'GS25 하루',url:'https://youtu.be/FWRQiAlhUKw'},'미완료 업무와 특이사항, 이어서 확인할 내용을 다음 근무자에게 전달해요.',[{id:'pending',label:'답변 대기·미완료 상태 전달',keywords:['대기','아직','미완료','기다리']},{id:'tasks',label:'남은 상품·고객 문의 명시',keywords:['상품','고객','문의']},{id:'next',label:'후속 확인 요청',keywords:['확인','전달','이어']}],'고객 문의는 경영주 답변을 기다리는 중이고 정리할 상품이 남아 있습니다. 답변을 확인해 고객에게 전달하고 남은 업무를 이어서 처리해 주세요.'),
].map(step => ({ ...step, ...sceneContext[step.id] }));
