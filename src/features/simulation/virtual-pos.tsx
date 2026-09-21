'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import type { RuleSnapshot } from '@/domain/types';
import { money, promotionDescription, promotionFor } from '@/domain/promotion';

export function VirtualPos({ snapshot, onLookup, disabled = false }: { snapshot: RuleSnapshot; onLookup: (productId: string) => void; disabled?: boolean }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const product = snapshot.products.find(product => product.id === selected);
  const matches = snapshot.products.filter(product => product.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="panel virtual-pos" aria-labelledby="pos-title"><div className="form-heading"><h2 id="pos-title">가상 POS</h2><span className="pill">합성 상품</span></div><label htmlFor="product-search">상품 검색<input id="product-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="상품 이름을 입력하세요"/></label><div className="product-list">{matches.map(item => <button className="product-button" aria-label={`${item.name} 조회`} key={item.id} disabled={disabled} onClick={() => { onLookup(item.id); setSelected(item.id); }}><span>{item.name}</span><span><Search aria-hidden size={15}/> 조회</span></button>)}{!matches.length && <p>검색한 상품이 없어요. 이름을 다시 확인해 주세요.</p>}</div>
    {product && <div className="pos-result" role="status"><h3>{product.name}</h3><dl><div><dt>단품 가격</dt><dd>{money(product.price)}</dd></div><div><dt>가상 재고</dt><dd>{product.inventory}개</dd></div></dl><p>{promotionDescription(product, promotionFor(product.id, snapshot.promotions))}</p><span className="small-note">조회 행동이 연습 기록에 남았어요.</span></div>}
  </section>;
}
