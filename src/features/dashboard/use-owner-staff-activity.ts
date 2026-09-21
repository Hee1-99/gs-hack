'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { cloudError, listOwnerStaffActivity, type OwnerStaffActivity } from '@/lib/supabase/cloud';

export function useOwnerStaffActivity() {
  const auth=useAuth();
  const scope=auth.user&&auth.membership?.role==='owner'?`${auth.membership.store_id}:${auth.user.id}`:null;
  const [value,setValue]=useState<{scope:string|null;records:OwnerStaffActivity[]}>({scope:null,records:[]});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const generation=useRef(0);
  const refresh=useCallback(async()=>{
    const current=++generation.current;
    if(!scope||!auth.client||!auth.membership){setLoading(false);return;}
    setLoading(true);setError('');
    try{const records=await listOwnerStaffActivity(auth.client,auth.membership.store_id);if(current===generation.current)setValue({scope,records});}
    catch(cause){if(current===generation.current)setError(cloudError(cause));}
    finally{if(current===generation.current)setLoading(false);}
  },[scope,auth.client,auth.membership]);
  useEffect(()=>{void refresh();const onFocus=()=>{void refresh();};window.addEventListener('focus',onFocus);return()=>{generation.current++;window.removeEventListener('focus',onFocus);};},[refresh]);
  return {records:value.scope===scope?value.records:[],loading,error,refresh};
}
