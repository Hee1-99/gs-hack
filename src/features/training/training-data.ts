export type TrainingMode = 'practice' | 'test';
export type TrainingSource = { title: string; url: string };
export type TrainingStep = {
  id: string;
  chapter: '근무 준비' | 'POS 판매' | '문제 해결';
  title: string;
  situation: string;
  customer: string;
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
export const trainingSteps: TrainingStep[] = [
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

export const trainingChapters = ['근무 준비', 'POS 판매', '문제 해결'] as const;
