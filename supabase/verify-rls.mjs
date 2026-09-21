// Local PostgreSQL-WASM verification. This does not connect to a Supabase project.
// npm install --prefix .vercel/sql-verification --no-save --no-package-lock @electric-sql/pglite
// node supabase/verify-rls.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '../.vercel/sql-verification/node_modules/@electric-sql/pglite/dist/index.js';
import { pgcrypto } from '../.vercel/sql-verification/node_modules/@electric-sql/pglite/dist/contrib/pgcrypto.js';
const db = new PGlite({ extensions: { pgcrypto } });
const ownerA='00000000-0000-4000-8000-000000000001', ownerB='00000000-0000-4000-8000-000000000002';
const crewA='00000000-0000-4000-8000-000000000003', crewB='00000000-0000-4000-8000-000000000004';
const outsider='00000000-0000-4000-8000-000000000005';
let checks=0;
async function check(name, action){await action();checks++;console.log(`PASS ${name}`);}
async function as(user){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user ?? '']);await db.exec(user?'set role authenticated':'set role anon');}
async function fails(sql, params, code='42501'){await assert.rejects(db.query(sql,params),error=>error.code===code);}
async function scalar(sql,params){const result=await db.query(sql,params);return Object.values(result.rows[0])[0];}
try {
 await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
 for(const id of [ownerA,ownerB,crewA,crewB,outsider])await db.query('insert into auth.users(id)values($1)',[id]);
 await db.exec(await readFile(new URL('./migrations/202609210001_gstep_team_auth.sql',import.meta.url),'utf8'));
 console.log('PASS unmodified migration executes in PostgreSQL (PGlite with pgcrypto)');checks++;
 await as(ownerA);const storeA=await scalar("select public.gstep_create_store('가상 A점','경영주 A','[]','[]')");const inviteA=await scalar('select public.gstep_create_invite()');
 await as(ownerB);const storeB=await scalar("select public.gstep_create_store('가상 B점','경영주 B','[]','[]')");const inviteB=await scalar('select public.gstep_create_invite()');
 await as(crewA);await db.query("select public.gstep_join_store($1,'직원 A')",[inviteA]);
 await as(crewB);await db.query("select public.gstep_join_store($1,'직원 B')",[inviteB]);
 await check('two stores have independent owner and invited crew memberships',async()=>{await as(ownerA);const rows=(await db.query('select user_id,role from public.gstep_memberships')).rows;assert.equal(rows.length,2);assert.deepEqual(new Set(rows.map(row=>row.user_id)),new Set([ownerA,crewA]));});
 await check('crew sees self membership and only own store content',async()=>{await as(crewA);assert.equal((await db.query('select * from public.gstep_memberships')).rows.length,1);assert.equal(await scalar('select store_id from public.gstep_store_content'),storeA);assert.equal((await db.query('select * from public.gstep_store_content where store_id=$1',[storeB])).rows.length,0);});
 await check('crew cannot elevate role or write shared configuration',async()=>{await fails("update public.gstep_memberships set role='owner' where user_id=$1",[crewA]);await fails("select public.gstep_save_content($1,1,'[]','[]')",[storeA]);await fails('select public.gstep_create_invite()');await fails("select public.gstep_create_store('다른 매장','직원','[]','[]')");});
 await check('owner shared content write succeeds only within own store and version',async()=>{await as(ownerA);assert.equal(await scalar("select public.gstep_save_content($1,1,'[]','[]')",[storeA]),2);await fails("select public.gstep_save_content($1,1,'[]','[]')",[storeA],'40001');await fails("select public.gstep_save_content($1,1,'[]','[]')",[storeB]);});
 await check('crew writes own checklist state while owner can read but cannot directly overwrite it',async()=>{await as(crewA);await db.query("select public.gstep_save_staff_state($1,0,'[{\"itemId\":\"stock\",\"status\":\"done\"}]','[]')",[storeA]);await fails("select public.gstep_save_staff_state($1,0,'[]','[]')",[storeB]);await as(ownerA);assert.equal(await scalar('select user_id from public.gstep_staff_state'),crewA);await fails("update public.gstep_staff_state set questions='[]' where user_id=$1",[crewA]);await as(crewB);assert.equal((await db.query('select * from public.gstep_staff_state')).rows.length,0);});
 const recordA='00000000-0000-4000-8000-000000000011', recordB='00000000-0000-4000-8000-000000000012';
 const insert='insert into public.gstep_learning_records(store_id,user_id,kind,record_id,payload)values($1,$2,$3,$4,$5)';
 await check('crew records persist own identity and reject user/store spoofing',async()=>{await as(crewA);await db.query(insert,[storeA,crewA,'quiz',recordA,JSON.stringify({id:recordA,score:75})]);await fails(insert,[storeA,ownerA,'quiz',recordB,JSON.stringify({id:recordB})]);await fails(insert,[storeB,crewA,'quiz',recordB,JSON.stringify({id:recordB})]);await fails(insert,[storeA,crewA,'quiz',recordB,'{}'],'23514');});
 await check('owner reads linked staff history, other stores and their crews cannot',async()=>{await as(ownerA);assert.equal((await db.query('select * from public.gstep_learning_records')).rows.length,1);await as(ownerB);assert.equal((await db.query('select * from public.gstep_learning_records')).rows.length,0);await as(crewB);await db.query(insert,[storeB,crewB,'chat',recordB,JSON.stringify({id:recordB,score:90})]);assert.equal((await db.query('select * from public.gstep_learning_records')).rows.length,1);await as(crewA);assert.equal(await scalar('select record_id from public.gstep_learning_records'),recordA);});
 await check('owner cannot alter linked staff score',async()=>{await as(ownerA);const result=await db.query("update public.gstep_learning_records set payload=$1 where record_id=$2 returning record_id",[JSON.stringify({id:recordA,score:100}),recordA]);assert.equal(result.rows.length,0);});
 await check('invitation is single-use and private tokens cannot be listed',async()=>{await as(outsider);await fails("select public.gstep_join_store($1,'외부')",[inviteA],'22023');await fails('select * from gstep_private.invites');assert.equal((await db.query('select * from public.gstep_memberships')).rows.length,0);});
 await check('anonymous access cannot read or change team data',async()=>{await as(null);await fails('select * from public.gstep_learning_records');await fails("select public.gstep_create_store('익명','익명','[]','[]')");});
 console.log(`${checks} local SQL checks passed. Live Supabase auth/RLS/network verification is still required.`);
} finally { await db.close(); }
