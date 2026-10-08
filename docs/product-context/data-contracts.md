# Data contracts

For each screen/area: **Screen → API/data source → important response information → actions/mutations → resulting state.** All paths are under the console API base (`/api`). These are the contracts the **current** client consumes (read from `src/lib/*.ts`); the new UI may use the same endpoints or a rebuilt data layer, but the **information** must stay available. CONFIRMED = read in client code/types; the server itself was not inspected (UNKNOWN: server-side validation beyond what the client mirrors).

## 0. Cross-cutting transport rules (CONFIRMED)
| Concern | Rule |
|---|---|
| Auth | httpOnly session cookie, `credentials: same-origin/include`; the browser never holds a token. 401 → session expired (sign in again); 403 `code` distinguishes sign-in refusals (`not_provisioned`, `account_disabled`, `invite_pending`, `network_restricted`). Each navigation re-reads `/auth/me` and `/auth/permissions`. |
| Error shape | `ApiError(status, message, code, decisionId)`; the client branches on **codes**, never message text. Special codes: `PLATFORM_HOLD`, `HARNESS_BLOCKED` (only a platform admin can lift; show server sentence + decision link; no retry), `TZ_INVALID` (dashboard retries without tz), `RESUME_REASON_*`. |
| Dropped requests | `TypeError` or 502/504 ⇒ "dropped": a write may have succeeded — **re-read state, never blind re-send** (stop, terminate, accept, deploy). |
| Edge refusal | The CDN/WAF may return an HTML 403 ⇒ client message "The request was blocked before it reached the console. Retry or contact an administrator." Never advise changing input to get past it. |
| Write body encoding | POST/PUT/PATCH string bodies are sent as `aiworker-b64url-gzip` (gzip → unpadded base64url) so no WAF rule can match; ≤ ~6 KB gzip fits. Transport detail, not a UI concern. |
| Concurrency | Compositions: `If-Match: "<record_version>"` on PUT/PATCH/DELETE (412 on stale). Worker configuration: ETag/`If-Match`. Knowledge item decisions: `If-Match: "<item version>"`. |
| Idempotency | `Idempotency-Key` (pattern `[A-Za-z0-9._:-]{8,200}`) on package-draft creation, narrow (FNV-1a hash of sorted Skill names) and customer-delivery start. |
| Long operations | `WorkflowRunRecord` observed by **SSE** `GET /workflows/{id}/events?after=<seq>` with polling fallback (`waitForWorkflow`); cancel/resume endpoints; local deploys polled 2 s up to 180 s. |
| Freshness | Documents carry `generated_at`, `schema_version`, and often `freshness {state CURRENT|DELAYED|STALE|UNAVAILABLE, observed_at}` and provenance (`runtime` vs `platform` copy). |
| Truth rules | `null` = unknown ≠ 0; `{state: OBSERVED|NOT_MEASURED|UNAVAILABLE, value}` measured values; `reachable:false` ⇒ "unknown"; list validity is checked at the read (`asList`) so a shape change fails visibly. |
| Time | The console shows times in the reader's zone; dashboard sends the browser IANA tz. |
| Polling | Shell: delivery operations every 15 s (paused when hidden). Dashboard: 30 s. Packaging: operations 5 s. Compose (packaging off-screen): 8 s. |

## 1. Auth, shell, admin
| Screen | Source | Important response info | Mutations | Resulting state |
|---|---|---|---|---|
| Login | `POST /auth/login`; `GET /auth/context` | Identity `{subject, username, email, displayName, roles[]}`; context `{realm, issuer, environment, entry public|private|unknown}` (null ⇒ "unknown") | login | session cookie |
| Shell | `GET /auth/me`; `GET /auth/permissions`; `POST /auth/logout`; `GET /delivery-operations[?active]`, `/delivery-operations/{id}` | Permissions `{userId, username, email, displayName, role, roleLabel, features[], groups[], bootstrap}` | logout | nav filtered by features; Active work + notices |
| Forgot / Set password | `POST /auth/forgot-password`; `GET /auth/invite|reset?token=`; `POST /auth/accept-invite|reset` | LinkSubject `{email, displayName, roleLabel, minPasswordLength}` | set password | account active / password changed |
| Admin people/groups | `GET /admin/catalog`, `/admin/users`, `/admin/users/{id}`, `/admin/groups`, `/admin/activity` | Catalog `{roles[{key,label,description,features}], features[{key,label,group,description}], featureGroups[], groups[], email{configured,reason}, provisioning{configured,reason}}`; Person (see domain-model §16) | `POST /admin/users` (→ `{user, invite}`), `PATCH /admin/users/{id}` `{email,displayName,role,internetAccess,groups,grants,denies}`, `POST …/enable|disable|resend-invite`, `POST/PATCH/DELETE /admin/groups` | person/group records; edit signs the person out everywhere |

## 2. Dashboard
| Source | Important response information | Resulting UI state |
|---|---|---|
| `GET /dashboard/executive?window=7d|30d|90d|all&tz=<IANA>` (`dashboard-executive-v4`) | `window{key,start_at,end_at,previous_*,bucket hour|day|week|all,tz,tz_fallback}`; `freshness`; `headlines{registered_workers, packaged_workers, completed_runs, dod_met, active_workers, average_run_duration}` each `{state,value,previous_value,comparison{state,absolute,percent}}`; `outcome_series[{key,label,start_at,end_at,met,not_met,not_adjudicable}]`; `bounded_contexts[]` and `identities[]` (ExecutiveCut: key,label,registered,packaged,completed_runs,verified_outcomes,dod_rate,model_cost_per_run,tokens_per_run,total_cost,total_tokens,cost_coverage,token_coverage); `model_routing`; `definition_of_done{met,not_met,not_adjudicable,rate,criteria[{key,label,gating,measured_runs,passed_runs,pass_rate,threshold,unit}]}`; `run_economics{completed_runs,cost_coverage,token_coverage,model_cost_per_run,tokens_per_run,total_cost,total_tokens}`; `run_ledger{rows[LedgerRun],returned,completed_runs,truncated}`; `autonomy[{level,label,completed_runs,dod_met}]`; `governance{active_workers,data_quality[]}` | Page; a malformed body (missing `freshness`/`run_economics`) is an error, never rendered |
Actions: none (read-only). Deep links out: `/workers/{id}?view=runs&run={ref}`.

## 3. Compose
| Step | Source | Important response info | Mutation | Resulting state |
|---|---|---|---|---|
| Declaration | `GET /compose/worker-types` (`worker-type-catalog-v1`); `GET /compose/worker-identities?worker_type=` (`worker-assignment-view-v1`: identities[{key,worker_type_key,display_name,summary,entitles,availability,availability_detail,bounded_context_count}], domains[{key,display_name,summary,dsl_domain_ids,skill_count,domain_language,sample_bundled}]); `GET /compose/bounded-contexts?worker_type&identity` (BoundedContextRow: key,version,display_name,summary,adds,step_label,harness_stage,outcome,availability,in_scope,out_of_scope,pipeline{key,display_name,step_count,steps[]},skill_names,metric_count,dod_criterion_keys,evidence_requirements,evaluation_slugs,harness{display_name,package_version},model_id,seed_maker_model_id,verifier_model_id,routing_gap); `GET /compose/geographies?business_domain=` (`compose-geographies-v1`); `GET /compose/dod-rubrics` | as listed | `POST /compositions` `{draft}` (draft-v8) → CompositionRecord; `PATCH /compositions/{id}` `{maturity_envelope}` (If-Match) | draft at r1; identity reserved |
| Resume | `GET /compositions/{id}`; `GET /compositions/{id}/stage-runs` → `{revision, runs[StageRunRecord]}`; `GET /compositions/{id}/compose-experience` (`compose-experience-v2`: identity{…}, stations[{key,title,summary,state,preset,editable,source_stages}], post_deploy_configuration, internal_stage_order); passport (own packages); `GET /delivery-operations?composition=` | — | — | rebuilt journey |
| Stage | `POST /compositions/{id}/stages/{stage}` → `{stage_run_id, stage, events}`; event stream (9 kinds); `GET /compose/stage-runs/{id}` (`compose-stage-run-v1`: state, degraded, error_code/message, proposal, accepted_at, elapsed_ms) | — | `POST /compose/stage-runs/{id}/accept` `{answers}` | stage accepted; later stage starts; experience re-read |
| Editors | `GET /compose/catalog` (agents 250, skills 111, resources 54, models 22, evaluations 121 in capture; `partial`, `sources`), `/compose/patterns`, `/compose/instruction-guide`, `/compose/policy-options`, `/compose/environment-profiles`, `/compose/tools`, `/compose/harnesses`, `/compose/assist/health`, `/compose/dsl/domains`, `/compose/domain-languages` | — | `PUT/PATCH /compositions/{id}` (If-Match), `POST /compose/instructions/evaluate` (→ score/band/sections/gaps), `POST /compose/assist` (task ∈ preset.resolve, spec.critique, spec.author, steps.derive, capability.recommend, routing.recommend, dod.recommend, flow.check, interview.next, interview.synthesize, gap.fix, intent.render, tab.assist, entry.validate, decision.propose, identity.propose → `proposal`, `degraded`+`reason`), `POST /compositions/{id}/revisions/{rev}/compile` (environment), `…/decisions/{decision}/compile` (policy), `GET …/decision-results`, `GET …/revisions/{rev}/readiness` | revision +1; compile results PASSED / NEEDS_INPUT / BLOCKED |
| Package & deploy | see §5 | | | |
Assist is **advisory**: a `degraded:true` result means nothing was proposed ("no partial draft").

## 4. Saved drafts and Registry
| Screen | Source | Info | Mutation |
|---|---|---|---|
| Saved drafts | `GET /compositions` (CompositionRecord: id,name,status,current_revision,record_version,draft,identity,created_at,updated_at); `GET /compositions/packageable?limit=100` | — | `DELETE /compositions/{id}` (If-Match; 403/409/412) |
| Registry | `GET /worker-portfolio?cursor&limit≤200` (`worker-portfolio-v1`: freshness, totals{workers,serving,attention}, bounded_contexts[{key,label,workers}], workers[PortfolioWorker], next_cursor); `GET /customer-packages?cursor`; `GET /sentinel/learning`; `GET /source-publication`; per-open `GET /compositions/{id}/passport`, `GET /workers/{id}/access` | PortfolioWorker: composition_id,created_at,name,worker_type,owner(+subject),revision,outcome,identity{state,spiffe_id},bounded_context{key,label,statement,exclusions},runtime{serving,stopped,attention,substrates,reachable_worker_id},last_outcome{verdict,finished_at,last_run_at,runs},routing{mode,router},learning{memories,recent_delta,contradictions,runs,last_at},brain{state,engine,composed_engine_version,durability,observed_at},sentinel{state,worker_runtime,observed_at} | redeploy/resume (see §6) |

## 5. Packaging, deployment, delivery
| Screen | Source | Info | Mutations → state |
|---|---|---|---|
| Packaging | `GET /compositions/packageable` (`packageable-compositions-v1`: compositions[{composition_id,name,revision,identity,bounded_context_key,created_at,updated_at,readiness,blocking_issues,issues[{code,message,section}],contents{context_label,business_domain_key,skills,languages,evaluations,dod_criteria,operating_mode,harness},package{id,status,composition_revision,created_at}|null,maturity{runs,runs_met,last_run_at,skill_changes,claims,memories,learned_at,memory_kinds,claims_agreed[]}}], totals{active,to_package,packaged,deployed}); `GET /workers`; `GET /delivery-operations?active` | — | — |
| Package build | `POST /package-drafts` (Idempotency-Key) → PackageDraftRecord + workflow; `GET /package-drafts/{id}`, `/contents` (BUILT/NOT_BUILT; sections integrity), `/holdings`, `/matured`; `GET /compositions/{id}/worker-intent`, `/tools`, `/spending-limit`; `GET/POST /package-drafts/{id}/source`; `GET /package-drafts/{id}/download` | — | package `DRAFT_QUEUED→PREPARING→READY|FAILED`; samples chosen are saved to the composition when building |
| Deploy | `GET /deployment-targets` (download, content_store, local, ecs{region,cluster,architecture,cpu,memory,capacity FARGATE|FARGATE_SPOT,auto_stop_minutes,private}); `GET /package-drafts/{id}/spending-limit` (SpendingLimitOffer{minimum,maximum,value,value_from,confirm_required,in_force,inherited,worker_type_default,month_spend,enforcement}) | — | `POST /package-drafts/{id}/deployments/ecs` `{spending_limit_usd, spending_limit_confirmed, auto_stop_minutes(0=until stopped)}`; `…/deployments/local`; `…/delivery-operations/ecs` → Worker record DEPLOYING→RUNNING/FAILED; limit recorded |
| Customer delivery | `GET /compositions/packageable`; `GET /customer-packages?cursor` (pages of 24; first read ≤ 10 pages); `GET /customer-packages/{id}`; `GET /source-publication` | — | `POST /customer-packages/{id}/share` `{expires_in_seconds:86400}` → `{url, expires_at, images_url, images_size_bytes, images_sha256}`; `POST …/acknowledge`; `POST …/publish-source` → `{state, repository, tag, commit}` |
| Wizard | as above + `GET /package-drafts/{id}/matured` | MaturedOffer{sections[{key memory|brain|skills,label}], memory{records,kinds}, brain{claims,rule,sentences[]}, skills[{skill,additions[{id,section,addition,scope,runs,at}]}]} | `POST /package-drafts/{id}/narrow` `{skill_names}` → `{composition_id,revision,dropped_skills,package,workflow}`; `POST /package-drafts/{id}/customer-deliveries` `{destination_label, include[], images, skill_additions?}` → `{package_id, composition_id, workflow, started}` (`started:false` = joined an identical in-flight one) → delivery PREPARED |

## 6. Worker detail, runtimes, operate
| Screen | Source | Info | Mutations |
|---|---|---|---|
| Worker detail | `GET /compositions/{id}/passport` (`worker-passport-v1`: composition_id,name,current_revision,package_revision,configuration_revision,owner,pattern_*,outcome,harnesses,models{maker,verifier},out_of_scope,identity,principals[],definition_of_done[],assembly{bounded_context,intent{document,agents,harness,tools},skills,domain_languages,memory,evaluations,governance{autonomy_level,operating_mode,monthly_limit_usd,sentinel_mode},runtime{target,auto_stop_minutes}},spending_limit,packages[],runtimes[],sample_archives[],configurable[]); `GET /compositions/{id}`; `GET /compositions/{id}/runs` (kept runs); `GET /workers/{rt}/runs`; `GET /workers/{rt}/ui/api/worker/runs/{runId}`; `GET /compositions/{id}/memories?memory_type&contradicted&include_archived`; `GET /compositions/{id}/brain`; `GET /workers/{rt}/learning`; `GET /workers/{rt}/runtime-observation`; `GET /workers/{rt}/access` (routes configuration|screen|desktop|terminal with availability+detail+url); `GET /workers/{rt}/carrying` | — | `POST /compositions/{id}/identity/{pause|resume|revoke}`; `POST /workers/{rt}/runs/samples/{key}` |
| Runtime lifecycle | `GET /workers`, `/workers/{id}`, `/workers/{id}/status`, `/workers/{id}/components`, `/workers/{id}/redeploy` (WorkerRedeployPlan: choices[current_certified|as_last_time with checks], default_choice, auto_stop_minutes, last_deployment, learning_seed, held, spending_limit), `/workers/{id}/spending-limit` | — | `POST /workers/{id}/stop` `{reason}` (→ record with `stop_decision_id`); `POST …/redeploy` `{images, spending_limit…, resume_reason?}`; `POST …/resume` `{reason, spending_limit…}`; `DELETE /workers/{id}` (terminate) |
| Configuration | `GET /workers/{id}/configuration/schema`, `GET /workers/{id}/configuration` (+ETag) | groups[fields{path,label,kind,mode,editable,bounds,apply,rule,approval_ref,source,description}] | `PATCH /workers/{id}/configuration` (If-Match ETag, optional approval ref) → `{value, apply LIVE|RESTART_REQUIRED|REDEPLOY_REQUIRED}` |
| Operate | `GET /dashboard/summary`, `/operations`, `/workers`, `/delivery-operations`, `/model-router` | — | as above + workflow cancel/resume |

## 7. Knowledge
| Screen | Source | Info |
|---|---|---|
| Skills | `GET /knowledge-base/skills` (`knowledge-skills-v1`: generated_at, partial, categories[], groups[{key,label,summary,total,ungrouped}], skills[KnowledgeSkill]); `GET /compose/skills/{name}/package` (`aiworker-skill-package-v1`: body, files[{path,kind,size_bytes}], triggers, tags…); `GET /compose/skills/{name}/files?path=` |
| Skill wizard | `POST /knowledge-base/skills/check` (`skill-draft-check-v2`: files, digest, agents{proposed,all}, structure/contract/duplication verdicts{tier,publishable,checked,findings}, security{risk_score,severity,advice,findings,skipped_analyzers}, publishable, registry_writable, registry_read); `POST …/draft` (→ `{draft_id, poll_after_ms}`) and `GET …/draft/{id}` (state working|ready|failed; body, eval_contract, questions); `POST …/publish`; `GET …/skills/{name}/package`; `POST …/revise` |
| DSL | `GET /compose/dsl/domains` (`aiworker-dsl-catalog-v1`), `/compose/dsl/domains/{id}/tree|nodes/{node}`, `GET /knowledge-base/languages/{id}/graph`, `GET /knowledge-base/business-hierarchy` |
| EVAL | `GET /knowledge-base/eval-catalogue` (`eval-catalogue-v1`), `/knowledge-base/eval-templates/{slug}`, `/knowledge-base/eval-playbooks/{nodeId}/resolved`, `GET /compose/golden-dataset/{packageKey}` |
| DoD | `GET /knowledge-base/definition-of-done` (`aiworker-dod-library-v1`: tree[nodes{kind root|worker_type|bounded_context, criteria, inherited, not_graded}], evidence[{metric_name,measured_runs,passed_runs}], evidence_available, contexts_resolved), `GET /compose/dod-rubrics` |
| Models | `GET /knowledge-base/models` (`aiworker-small-models-v1`) |
| Governance | `GET /knowledge/coverage|loop|items|items/{id}|items/{id}/lineage|packs|packs/{v}/diff` with `context=`; `POST /knowledge/items/{id}/decisions` `{schema_version:"knowledge-decision-request-v1", action promote|reject|defer, item_version, reason}` (If-Match) → `knowledge-decision-v1` `{status deferred|promoted|rejected, decided_by, decided_at}` |
| Estate memory | `GET /knowledge/landscape?topic_limit&activity_limit`, `/knowledge/topics/{key}?limit=50`, `/knowledge/brains` (`worker-brain-fleet-v1`) — client exists; mounted screen UNKNOWN |

## 8. Learning
| Screen | Source (all via `Read<T>`: ok / forbidden / expired / not_found / not_built / unavailable) | Info |
|---|---|---|
| Estate | `GET /learning/workers?period=all|90d|30d` (`learning-workers-v1`: totals{experiences,okf_approved,skills_adopted,tokens_per_met_run}, workers[RankedWorker with score{value,terms{E,P,S,C},partial,terms_reported}, provenance, top_item], effect{comparable,not_comparable}, truncated); `GET /learning/skill-changes` (`learning-skill-changes-v1`, `available:false` = store unreadable) |
| Worker overview | `GET /learning/workers/{id}` (`learning-worker-v1`: worker header, okf block, sentinel summary, cards[9]); `GET …/effect`; `GET …/platform-decisions` (`learning-platform-decisions-v1`) |
| Sub-pages | `GET /learning/workers/{id}/decisions`, `/items?card=`, `/items/{item}/evidence`, `/sharing`, `/records[?class&cursor&unlearned]`, `/records/{class}/{id}`, `/sync`; `GET /compositions/{id}/skill-changes` (`worker-skill-changes-v1`: state available|none|unreachable|kept, rule, claims, changes[{skill,section,addition,diff,before,after,evidence}]); routing `GET/POST /workers/{rt}/routing…` |
| OKF | bundle manifest + files through the Runtime (digest-verified); `GET/POST /compositions/{id}/knowledge/{proposals|proposals/{id}|…/withdraw|approve|decline|history|history/restore|use-package|overlay}` |
| Runtime learning | `GET /workers/{rt}/learning` (`worker-learning-v1`; 409 = no Worker Runtime), `GET /workers/{rt}/learning/runs/{run}`, `…/events/{seqs}`, `…/patterns`; `GET /sentinel/learning` (`sentinel-learning-fleet-v1`) |

## 9. Sentinel
| Screen | Source | Info |
|---|---|---|
| Overview | `GET /platform/sentinel/overview` (`platform-sentinel-overview-v1`) | window_days, viewer.admin, mode, coverage, chain, dimensions[5], in_force[], stream[], needs_review |
| Dimension | `GET /platform/sentinel/dimensions/{monitor|enforce|align|control|unlearn}` | tiles, criteria[], panel (fleet_watch | rules | patterns | control | withdrawn), decisions |
| Decisions | `GET /platform/sentinel/decisions?dimension&severity&scope&mode&signals&cursor`; `GET …/decisions/{id}` | tiles, weeks, entries (with parent/children), cursor; decision record (§domain-model 14) |
| Policy | `GET /platform/sentinel` (policy doc; admin) | bounds / managed / directives by path |
| Stop | `POST /workers/{rt}/stop` | decision id |

## 10. Harnesses
`GET /harnesses` (`harness-catalogue-v1`), `GET /harnesses/{key}` (`harness-detail-v1`), `GET /harnesses/conformance`, `GET /harnesses/conformance/{id}`, `GET /harness-contract` (SDK pages), `GET /compose/harnesses` (Compose picker: `harness-catalog-v1` with settings and `ui_path`).

## UNKNOWN
Exact server validation rules beyond what the client mirrors; response bodies for endpoints not present in the offline capture (admin, learning per-Worker, platform decisions, environment profiles, policy options, instructions guide); whether `/knowledge/landscape|topics|brains` currently have a mounted UI.
