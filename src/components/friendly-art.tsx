/** Original FirstDay illustrations. No official brand assets or real POS artwork. */
export function ToolArt({ kind }: { kind: 'quiz' | 'chat' | 'check' }) {
  const id = `tool-${kind}`;
  return <svg className="friendly-tool-art" viewBox="0 0 160 160" fill="none" aria-hidden="true">
    <defs><linearGradient id={`${id}-body`} x1="35" y1="20" x2="125" y2="145" gradientUnits="userSpaceOnUse"><stop stopColor={kind === 'quiz' ? '#ffe89a' : kind === 'chat' ? '#a4f5fd' : '#9df3cd'}/><stop offset="1" stopColor={kind === 'quiz' ? '#ffbd3b' : kind === 'chat' ? '#02b8d0' : '#31c696'}/></linearGradient><linearGradient id={`${id}-paper`} x1="40" y1="32" x2="112" y2="122"><stop stopColor="white"/><stop offset="1" stopColor="#eaf1f8"/></linearGradient><filter id={`${id}-shadow`} x="-40%" y="-30%" width="190%" height="190%"><feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#364b70" floodOpacity=".16"/></filter></defs>
    <ellipse cx="82" cy="139" rx="43" ry="8" fill="#dce1ed" opacity=".65"/>
    {kind === 'chat' ? <g filter={`url(#${id}-shadow)`}><path d="M32 29h79a22 22 0 0 1 22 22v42a22 22 0 0 1-22 22H76l-26 22 3-22H32a22 22 0 0 1-22-22V51a22 22 0 0 1 22-22Z" fill={`url(#${id}-body)`}/><path d="M34 34h68" stroke="white" strokeOpacity=".6" strokeWidth="5" strokeLinecap="round"/><circle cx="45" cy="74" r="6" fill="white"/><circle cx="72" cy="74" r="6" fill="white"/><circle cx="99" cy="74" r="6" fill="white"/><rect x="95" y="101" width="48" height="35" rx="15" fill={`url(#${id}-paper)`}/><path d="m107 118 7 7 14-14" stroke="#00a4b8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></g> : <g transform="rotate(9 80 80)" filter={`url(#${id}-shadow)`}><rect x="36" y="25" width="88" height="109" rx="15" fill={`url(#${id}-body)`}/><rect x="44" y="34" width="72" height="89" rx="9" fill={`url(#${id}-paper)`}/><rect x="59" y="18" width="42" height="22" rx="9" fill={kind === 'quiz' ? '#f39927' : '#008979'}/><rect x="65" y="21" width="29" height="5" rx="2.5" fill="white" opacity=".42"/>{[59,81,103].map((y,i)=><g key={y}><rect x="54" y={y-5} width="12" height="12" rx="4" fill={kind === 'quiz' ? '#ffebac' : '#bcf2dd'}/><path d={`m57 ${y+1} 3 3 5-6`} stroke={kind === 'quiz' ? '#bc701c' : '#138971'} strokeWidth="2" strokeLinecap="round"/><path d={`M76 ${y+1}h${i===2?20:27}`} stroke="#a3aeba" strokeWidth="5" strokeLinecap="round"/></g>)}{kind==='quiz'&&<g><circle cx="120" cy="111" r="22" fill="#00bfd4"/><path d="m120 96 4 9 10 1-8 7 3 10-9-5-9 5 3-10-8-7 10-1Z" fill="white"/></g>}</g>}
  </svg>;
}

export function StoreArt() {
  return <svg className="friendly-store-art" viewBox="0 0 460 370" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="store-wall" x1="83" y1="112" x2="325" y2="301" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff"/><stop offset="1" stopColor="#d9eaf3"/></linearGradient>
      <linearGradient id="store-cap" x1="210" y1="118" x2="302" y2="210" gradientUnits="userSpaceOnUse"><stop stopColor="#32e3ea"/><stop offset="1" stopColor="#00a6c0"/></linearGradient>
      <linearGradient id="store-face" x1="200" y1="150" x2="285" y2="244" gradientUnits="userSpaceOnUse"><stop stopColor="#fffdf8"/><stop offset="1" stopColor="#e6e7e8"/></linearGradient>
      <linearGradient id="store-counter" x1="138" y1="243" x2="320" y2="334" gradientUnits="userSpaceOnUse"><stop stopColor="#ffe394"/><stop offset="1" stopColor="#ffc14e"/></linearGradient>
      <filter id="store-shadow" x="-40%" y="-40%" width="190%" height="200%"><feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#077b99" floodOpacity=".19"/></filter>
    </defs>
    <ellipse cx="241" cy="332" rx="157" ry="21" fill="#00a7ba" opacity=".17"/>
    <g filter="url(#store-shadow)"><rect x="78" y="91" width="288" height="210" rx="28" fill="url(#store-wall)"/><path d="M66 92c0-16 13-29 29-29h254c16 0 29 13 29 29v27H66V92Z" fill="#f6fdff"/>
      <path d="M65 115h53v21a26 26 0 0 1-53 0v-21Zm105 0h53v21a26 26 0 0 1-53 0v-21Zm105 0h53v21a26 26 0 0 1-53 0v-21Z" fill="#00bfd4"/>
      <path d="M118 115h52v21a26 26 0 0 1-52 0v-21Zm105 0h52v21a26 26 0 0 1-52 0v-21Zm105 0h51v21a25.5 25.5 0 0 1-51 0v-21Z" fill="#c4f5fa"/>
      <rect x="113" y="78" width="124" height="20" rx="10" fill="#e1f5f8"/><circle cx="126" cy="88" r="4" fill="#04b9cb"/><path d="M139 88h82" stroke="#38bdcd" strokeWidth="5" strokeLinecap="round"/>
      <rect x="95" y="174" width="96" height="96" rx="13" fill="#c0ecf3"/><path d="M142 179v86M100 220h86" stroke="#f3fcfd" strokeWidth="7"/>
    </g>
    <g filter="url(#store-shadow)"><ellipse cx="264" cy="251" rx="69" ry="66" fill="url(#store-cap)"/><ellipse cx="258" cy="192" rx="60" ry="57" fill="url(#store-face)"/><ellipse cx="202" cy="196" rx="12" ry="16" fill="#f0efec"/><ellipse cx="315" cy="196" rx="12" ry="16" fill="#f0efec"/>
      <path d="M201 177c-4-35 19-62 58-62 39 0 60 25 60 55v9c-37-9-79-8-118-2Z" fill="url(#store-cap)"/><path d="M202 174c29-9 57-7 80 0 16 5 12 14-3 14h-75c-13 0-16-10-2-14Z" fill="#0093b0"/><path d="M211 140c11-11 23-17 36-17" stroke="#99ffff" strokeWidth="7" strokeLinecap="round" opacity=".7"/>
      <ellipse cx="239" cy="199" rx="5" ry="7" fill="#253447"/><ellipse cx="279" cy="199" rx="5" ry="7" fill="#253447"/><circle cx="226" cy="214" r="8" fill="#ffbbae" opacity=".6"/><circle cx="292" cy="214" r="8" fill="#ffbbae" opacity=".6"/><path d="M251 216q8 10 16 0" stroke="#586375" strokeWidth="4" strokeLinecap="round"/>
      <rect x="241" y="249" width="38" height="24" rx="7" fill="#e1fcff"/><circle cx="251" cy="260" r="4" fill="#04becd"/><path d="M260 256h11m-11 7h7" stroke="#06b7c7" strokeWidth="3" strokeLinecap="round"/>
    </g>
    <g filter="url(#store-shadow)"><rect x="107" y="280" width="259" height="42" rx="11" fill="url(#store-counter)"/><rect x="98" y="267" width="277" height="19" rx="9.5" fill="#ffebaf"/><rect x="122" y="211" width="97" height="61" rx="9" fill="#334e68"/><rect x="129" y="218" width="82" height="43" rx="5" fill="#e4fbfc"/><rect x="138" y="227" width="39" height="5" rx="2.5" fill="#7bcbd6"/><rect x="138" y="238" width="26" height="4" rx="2" fill="#9eafbd"/><rect x="181" y="238" width="21" height="13" rx="4" fill="#00bfd4"/><rect x="162" y="271" width="20" height="6" rx="3" fill="#48657a"/><ellipse cx="305" cy="263" rx="24" ry="14" fill="#f6f3ee"/></g>
    <g transform="rotate(12 363 224)" filter="url(#store-shadow)"><rect x="341" y="186" width="68" height="66" rx="20" fill="#fffaf0"/><path d="m357 219 12 12 23-26" stroke="#00b8b6" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/></g>
    <path d="m74 195 4 10 11 3-11 4-4 10-4-10-10-4 10-3 4-10Zm298-146 3 8 9 3-9 3-3 8-3-8-8-3 8-3 3-8Z" fill="#fff7ce"/>
  </svg>;
}
