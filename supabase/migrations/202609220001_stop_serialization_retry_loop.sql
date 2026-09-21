begin;

-- SQLSTATE 40001 is reserved for retryable serialization failures. PostgREST
-- retries that code, so an ordinary optimistic-lock conflict can otherwise
-- stay alive indefinitely. Use a non-retryable application exception instead.
create or replace function public.gstep_save_content(target_store uuid, expected_version integer, next_rules jsonb, next_checklist jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare next_version integer;
begin
 if not gstep_private.owner_of(target_store) then raise insufficient_privilege; end if;
 if octet_length(next_rules::text)+octet_length(next_checklist::text)>200000 then raise exception 'Content too large'; end if;
 update public.gstep_store_content set rules=next_rules,checklist_items=next_checklist,version=version+1,updated_at=now() where store_id=target_store and version=expected_version returning version into next_version;
 if not found then raise exception 'Concurrent change' using errcode='P0001'; end if;
 return next_version;
end; $$;

create or replace function public.gstep_save_staff_state(target_store uuid, expected_version integer, next_progress jsonb, next_questions jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare next_version integer;
begin
 if not gstep_private.member_of(target_store) then raise insufficient_privilege; end if;
 if expected_version=0 then
  insert into public.gstep_staff_state(store_id,user_id,checklist_progress,questions) values(target_store,auth.uid(),next_progress,next_questions) on conflict do nothing returning version into next_version;
 else
  update public.gstep_staff_state set checklist_progress=next_progress,questions=next_questions,version=version+1,updated_at=now() where store_id=target_store and user_id=auth.uid() and version=expected_version returning version into next_version;
 end if;
 if next_version is null then raise exception 'Concurrent change' using errcode='P0001'; end if;
 return next_version;
end; $$;

revoke execute on function public.gstep_save_content(uuid,integer,jsonb,jsonb),public.gstep_save_staff_state(uuid,integer,jsonb,jsonb) from public,anon;
grant execute on function public.gstep_save_content(uuid,integer,jsonb,jsonb),public.gstep_save_staff_state(uuid,integer,jsonb,jsonb) to authenticated;

commit;

-- Stop requests that were already trapped in PostgREST's 40001 retry loop.
select pg_terminate_backend(pid)
from pg_stat_activity
where pid <> pg_backend_pid()
  and application_name like 'PostgREST%'
  and state = 'active'
  and (query like '%gstep_save_content%' or query like '%gstep_save_staff_state%');
