-- GStep: store-scoped memberships, shared rules/checklists and private learning history.
-- Apply only to the verified GStep Supabase project. No service-role key is used by the app.
begin;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists gstep_private;
revoke all on schema gstep_private from public;

create table public.gstep_stores (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) between 1 and 80),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table public.gstep_memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 store_id uuid not null references public.gstep_stores(id) on delete cascade,
 role text not null check(role in ('owner','crew')), display_name text not null check(length(trim(display_name)) between 1 and 40),
 created_at timestamptz not null default now(), unique(store_id,user_id)
);
create table public.gstep_store_content (
 store_id uuid primary key references public.gstep_stores(id) on delete cascade,
 rules jsonb not null default '[]' check(jsonb_typeof(rules)='array' and jsonb_array_length(rules)<=50),
 checklist_items jsonb not null default '[]' check(jsonb_typeof(checklist_items)='array' and jsonb_array_length(checklist_items)<=100),
 version integer not null default 1, updated_at timestamptz not null default now()
);
create table public.gstep_staff_state (
 store_id uuid not null, user_id uuid not null, checklist_progress jsonb not null default '[]', questions jsonb not null default '[]',
 version integer not null default 1, updated_at timestamptz not null default now(),
 primary key(store_id,user_id), foreign key(store_id,user_id) references public.gstep_memberships(store_id,user_id) on delete cascade,
 check(jsonb_typeof(checklist_progress)='array' and jsonb_typeof(questions)='array' and octet_length(checklist_progress::text)+octet_length(questions::text)<1000000)
);
create table public.gstep_learning_records (
 store_id uuid not null, user_id uuid not null, kind text not null check(kind in ('quiz','chat')), record_id uuid not null,
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<200000), updated_at timestamptz not null default now(),
 primary key(store_id,user_id,kind,record_id), foreign key(store_id,user_id) references public.gstep_memberships(store_id,user_id) on delete cascade,
 check(payload ? 'id' and payload->>'id'=record_id::text)
);
create table gstep_private.invites (
 token_hash bytea primary key, store_id uuid not null references public.gstep_stores(id) on delete cascade,
 expires_at timestamptz not null, used_by uuid references auth.users(id), created_by uuid not null references auth.users(id)
);

create function gstep_private.member_of(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.gstep_memberships m where m.user_id=auth.uid() and m.store_id=target);
$$;
create function gstep_private.owner_of(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.gstep_memberships m where m.user_id=auth.uid() and m.store_id=target and m.role='owner');
$$;
grant usage on schema gstep_private to authenticated;
grant execute on function gstep_private.member_of(uuid),gstep_private.owner_of(uuid) to authenticated;
revoke all on gstep_private.invites from anon,authenticated;

alter table public.gstep_stores enable row level security;
alter table public.gstep_memberships enable row level security;
alter table public.gstep_store_content enable row level security;
alter table public.gstep_staff_state enable row level security;
alter table public.gstep_learning_records enable row level security;
create policy store_member_read on public.gstep_stores for select to authenticated using(gstep_private.member_of(id));
create policy membership_self_or_owner_read on public.gstep_memberships for select to authenticated using(user_id=auth.uid() or gstep_private.owner_of(store_id));
create policy content_member_read on public.gstep_store_content for select to authenticated using(gstep_private.member_of(store_id));
create policy staff_self_or_owner_read on public.gstep_staff_state for select to authenticated using(user_id=auth.uid() or gstep_private.owner_of(store_id));
create policy records_self_or_owner_read on public.gstep_learning_records for select to authenticated using((user_id=auth.uid() and gstep_private.member_of(store_id)) or gstep_private.owner_of(store_id));
create policy records_self_insert on public.gstep_learning_records for insert to authenticated with check(user_id=auth.uid() and gstep_private.member_of(store_id));
create policy records_self_update on public.gstep_learning_records for update to authenticated using(user_id=auth.uid() and gstep_private.member_of(store_id)) with check(user_id=auth.uid() and gstep_private.member_of(store_id));
revoke all on public.gstep_stores,public.gstep_memberships,public.gstep_store_content,public.gstep_staff_state,public.gstep_learning_records from anon,authenticated;
grant select on public.gstep_stores,public.gstep_memberships,public.gstep_store_content,public.gstep_staff_state to authenticated;
grant select,insert,update on public.gstep_learning_records to authenticated;

-- Caller metadata is never used for authorization. An owner may create ONLY a new store.
create function public.gstep_create_store(store_name text, display_name text, initial_rules jsonb, initial_checklist jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid; actor uuid:=auth.uid();
begin
 if actor is null then raise insufficient_privilege; end if;
 if exists(select 1 from public.gstep_memberships where user_id=actor) then raise exception 'Already a store member' using errcode='42501'; end if;
 if octet_length(initial_rules::text)+octet_length(initial_checklist::text)>200000 then raise exception 'Content too large'; end if;
 insert into public.gstep_stores(name,created_by) values(trim(store_name),actor) returning id into target;
 insert into public.gstep_memberships(user_id,store_id,role,display_name) values(actor,target,'owner',trim(display_name));
 insert into public.gstep_store_content(store_id,rules,checklist_items) values(target,initial_rules,initial_checklist);
 return target;
end; $$;
create function public.gstep_create_invite() returns text language plpgsql security definer set search_path='' as $$
declare target uuid; token text;
begin
 select store_id into target from public.gstep_memberships where user_id=auth.uid() and role='owner';
 if target is null then raise insufficient_privilege; end if;
 token:=encode(extensions.gen_random_bytes(24),'hex');
 insert into gstep_private.invites(token_hash,store_id,expires_at,created_by) values(extensions.digest(token,'sha256'),target,now()+interval '24 hours',auth.uid());
 return token;
end; $$;
create function public.gstep_join_store(invite_token text, display_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare invitation gstep_private.invites; actor uuid:=auth.uid();
begin
 if actor is null then raise insufficient_privilege; end if;
 if exists(select 1 from public.gstep_memberships where user_id=actor) then raise exception 'Already a store member' using errcode='42501'; end if;
 select * into invitation from gstep_private.invites where token_hash=extensions.digest(trim(invite_token),'sha256') and expires_at>now() and used_by is null for update;
 if not found then raise exception 'Invalid or expired invitation' using errcode='22023'; end if;
 insert into public.gstep_memberships(user_id,store_id,role,display_name) values(actor,invitation.store_id,'crew',trim(display_name));
 update gstep_private.invites set used_by=actor where token_hash=invitation.token_hash;
 return invitation.store_id;
end; $$;
create function public.gstep_my_membership() returns table(user_id uuid,store_id uuid,role text,display_name text,store_name text)
language sql stable security invoker set search_path='' as $$
 select m.user_id,m.store_id,m.role,m.display_name,s.name from public.gstep_memberships m join public.gstep_stores s on s.id=m.store_id where m.user_id=auth.uid();
$$;
create function public.gstep_save_content(target_store uuid, expected_version integer, next_rules jsonb, next_checklist jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare next_version integer;
begin
 if not gstep_private.owner_of(target_store) then raise insufficient_privilege; end if;
 if octet_length(next_rules::text)+octet_length(next_checklist::text)>200000 then raise exception 'Content too large'; end if;
 update public.gstep_store_content set rules=next_rules,checklist_items=next_checklist,version=version+1,updated_at=now() where store_id=target_store and version=expected_version returning version into next_version;
 if not found then raise exception 'Concurrent change' using errcode='P0001'; end if;
 return next_version;
end; $$;
create function public.gstep_save_staff_state(target_store uuid, expected_version integer, next_progress jsonb, next_questions jsonb)
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

revoke execute on all functions in schema gstep_private from public,anon;
revoke execute on function public.gstep_create_store(text,text,jsonb,jsonb),public.gstep_create_invite(),public.gstep_join_store(text,text),public.gstep_my_membership(),public.gstep_save_content(uuid,integer,jsonb,jsonb),public.gstep_save_staff_state(uuid,integer,jsonb,jsonb) from public,anon;
grant execute on function public.gstep_create_store(text,text,jsonb,jsonb),public.gstep_create_invite(),public.gstep_join_store(text,text),public.gstep_my_membership(),public.gstep_save_content(uuid,integer,jsonb,jsonb),public.gstep_save_staff_state(uuid,integer,jsonb,jsonb) to authenticated;
create index gstep_members_store_idx on public.gstep_memberships(store_id);
create index gstep_learning_store_time_idx on public.gstep_learning_records(store_id,updated_at desc);
commit;
