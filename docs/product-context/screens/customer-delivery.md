# Screen: Customer delivery — `/customer-delivery`

Source: `routes/delivery/CustomerDeliveryPage.tsx`, `CustomerPackageRow.tsx`, `WhatItHolds.tsx`, `HoldingDetail.tsx`; `lib/durableApi.ts` (`CustomerPackage`, `getCustomerPackageDirectory`, `shareCustomerPackage`, `acknowledgeCustomerPackage`, `publishCustomerSource`, `getSourcePublicationCapability`, `getPackageHoldings`); mock `/api/customer-packages`, `/api/source-publication`.

Rail: **Customer delivery** — "Prepare for a customer". Launcher tile: "Deliver to a customer — Prepare a Package for the customer's environment."

## 1. Purpose
Two jobs on one page: (a) **choose which packaged Worker to prepare for a customer** ("To prepare"), and (b) **keep the record of what has gone out** and the transfer evidence ("Prepared packages"). (CONFIRMED, file header)

## 2. Primary user
Delivery manager / release engineer handing a sealed Worker to a customer.

## 3. User jobs
See which sealed Packages are waiting for delivery, ranked by how much they have learned; read what a Package holds; start preparing; track each delivery; create a share link; record that the customer acknowledged; publish the generated source.

## 4. Information available

### 4.1 To prepare (default view)
A "To prepare" row = a Worker with a **sealed, ready Package** (`package.status === 'DRAFT_READY'`) and **no delivery record yet** (worker-level eligibility).

| Information | Meaning | Source | Importance |
|---|---|---|---|
| Worker name (link to Worker) | The Worker | `PackageableComposition.name` | High |
| Context | Bounded-context label (never the registry key) | `contents.context_label` or `identity.bounded_scope` | Medium |
| Package revision | e.g. "Package · r11" | `package.composition_revision` | High |
| Recorded learning | Runs ("No runs" or "N · M met"), Proposed Skill changes, Memory records (platform) by kind or "Not reported"/"None" | `maturity` | High (this is the ranking key) |
| Packaged date | When the Package was sealed | `package.created_at` | Medium |
| Newer-draft warning | "Newer draft available: r12. This Package is r11." | revision compare | High |
| Contents (expand) | The **sealed** Package's own lists (Skills, Domain Specific Languages with why-bound, EVALs, Definition of Done criteria + thresholds), read when opened ("Sealed Package · r11") — never the current draft's counts | `getPackageHoldings` | Medium |

**Ranking (CONFIRMED):** skill_changes×1000 + claims×100 + memories (descending), then runs, then latest run, then id. "An ordering, not a Learning score."

### 4.2 Prepared packages (`?view=delivered`)
One row per delivery record (`CustomerPackage`): Worker name · "For {customer}" · "Package · r{n}" (+ "version X" if not `r{n}`) · **State** · **Last evidence** (date or "Not observed") · actions. Detail (collapsed) sections:
- **Run requirements:** architecture, CPU, memory, storage, container runtime.
- **Contents:** each entry with integrity: Verified / Failed verification / Not verified / "Added beside the sealed Package" (learning and `run/` files that the package's own checksums do not cover). Plus "Container images inside the package · N MB" / "…as a separate download" / "Container images: Not reported" (a null `images` = unknown, not none), with sha256.
- **Learning callback:** Configured (Enabled/Disabled) · Last observed (Not observed / Connected / Failed).
- **Published with this delivery:** source state (Not published / Publishing / Published / Failed), repository, tag.
- **Artifact identity:** Digest, Delivery ID (copy), Expires.
- Footer: "Customer runtime status: not observed by this record."

**Delivery states (CONFIRMED):** `PREPARING`, `PREPARED`, `SHARED`, `DOWNLOADED`, `ACKNOWLEDGED`, `EXPIRED`, `FAILED`. Tone: PREPARED/DOWNLOADED/ACKNOWLEDGED success; SHARED info; EXPIRED warning; FAILED danger; PREPARING neutral. **Evidence scope (CONFIRMED comment):** Prepared is not sent; a share link is not receipt; an acknowledgement is not a deployment; a configured callback is not a connected one.

Mock: `customer-package-directory-v1` (empty or small in the offline capture — UNKNOWN count in this capture).

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Prepare delivery | Row link | Delivery directory fully read; Package sealed & ready | Opens `/customer-delivery/prepare/{packageId}` | Disabled with reason when eligibility is unknown: "Delivery records could not be read, so whether a Worker was already prepared is unknown." / "Reading delivery records…" / "Delivery records were only partly read, so whether a Worker was already prepared is unknown." |
| Contents | Row toggle | — | Reads sealed Package inventory; item names open a detail drawer (Skill `SKILL.md`, EVAL definition, DoD criterion, domain language) | "Package contents unavailable." + Retry |
| Create share link | Row button | State not PREPARING/FAILED ("Available once preparation finishes." / "Preparation failed. A failed Package cannot be shared.") | `POST /customer-packages/{id}/share` (default expiry 86,400 s). Shows Package link (+ Container images link if separate) with sizes, Copy buttons, expiry. "Send them to the customer yourself; no message was sent." | "Share link could not be created." |
| Record acknowledgement | More actions | State SHARED or DOWNLOADED | Confirm-in-place: "Records that {customer} acknowledged Package r{n} of {worker}. It records an acknowledgement only. It does not verify that the customer deployed or is running it." | "Acknowledgement could not be recorded." |
| Publish source | More actions | Source publication capability `available` | Confirm-in-place showing Destination (GitLab project), Package, Customer → "Source published as {tag}." | The recorded refusal reason, or "Source could not be published."; disabled with the capability's `detail` when unavailable |
| Search | "Search Worker or customer" | — | To prepare: by Worker name. Prepared: by Worker name or customer. | "Customer search applies to Prepared packages." |
| Filter | "Has recorded learning" checkbox (To prepare); State filter (Prepared) | — | — | — |
| Read more | When the directory is partial | `next_cursor` set | Reads the next delivery pages (pages of 24; first read up to 10 pages) | "The next delivery records could not be read." |
| Open Packaging | Header | — | `/packaging` | — |

## 6. Filters / search / sorting
URL holds everything: `view` (omitted = prepare | `delivered`), `q`, `learned=1`, `state`, `page` (1-based, 20 per page), `open` (the expanded record). Filter changes return to page 1. Prepared packages keep the order of the last explicit read (a share link or acknowledgement refreshes **quietly** and never moves a record being worked on); Refresh/navigation apply the new ranking: newest evidence first, undated last, then id. Coverage is stated where the count is: "Search covers N loaded records, the newest of M Workers." / "…the most recently prepared."

## 7. Navigation
In: rail; Launcher; Packaging rows; Worker Delivery tab. Out: wizard; Worker detail; Packaging.

## 8. State model
Three independent reads (packageable, directory, source capability, display names) that fail separately: a failed refresh keeps the records on screen; only a first read can fail to empty. Messages: "Workers with a Package could not be read." / "Delivery records could not be read." Header Updated moves only when every source was read. One open confirmation per page: opening one holds the other rows' commits.

## 9. Data dependencies
`GET /compositions/packageable`, `GET /customer-packages?cursor=`, `GET /customer-packages/{id}`, `GET /package-drafts/{id}/holdings`, `GET /source-publication`, `GET /compose/catalog` + `/compose/dsl/domains` (display names), `POST /customer-packages/{id}/share|acknowledge|publish-source`.

## 10. Business rules
RULE-070 only a sealed, `DRAFT_READY` Package can be prepared. RULE-071 a Worker already in the delivery directory is not offered again. RULE-072 eligibility is unknown (button disabled) unless every delivery record was read. RULE-073 sharing/acknowledging never claims receipt or deployment. RULE-074 name beats identifier everywhere a Skill/EVAL/language is shown (identifier only when the catalogue has no name).

## 11. Responsive requirements (inferred)
Collapsed record is one aligned row (Worker, State, Last evidence, actions); detail opens below. Section switch is a `SectionNav`.

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Header (Updated, Refresh, "Open Packaging") → section tabs (To prepare / Prepared packages) → search row → record list → pager.
