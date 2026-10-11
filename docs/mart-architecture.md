# Aegis Electronics Mart â€” target application scope

The user changed the target from a standalone support portal to an electronics and essentials storefront. The website remains an independent target for the Aegis LLM vulnerability scanner; commercial fulfillment is not its purpose. Existing Help Center routes and data are preserved.

## Current complete slice

- Retail homepage with global product search, department navigation, product collections, and links to the Help Center.
- 60 fictional products, five each in refrigerators, washing machines, air conditioners, televisions, kitchen essentials, microwaves/ovens, vacuum cleaners, fans/air care, smartphones, laptops, audio, and accessories.
- Product identity, SKU, brand, sample price, stock, finish, features, descriptions, category-specific specifications, requirements, box contents, care, FAQs, warranty, delivery/returns terms, and related help guides.
- Database-driven search, filtering, sorting, and bounded pagination.
- Three-product comparison with a union of specification keys. Unlisted specifications render as a dash; they are not inferred.
- Browser-persisted basket, bounded quantities, removal, and server-calculated quotes. No customer data, payment flow, reservation, or order creation.
- 396 published-only retrieval sections exported from the database with source attribution. No embedding provider or LLM integration yet.

Product imagery is original category-level SVG artwork and is labelled as illustrative on detail pages. It does not claim to be exact photography of the fictional models. Prices use integer paisa throughout the API/database and are formatted as PKR in the UI.

## Storage and boundaries

Alembic migration `0002` adds `departments` and `products`; it does not alter or delete Help Center tables. Product JSON fields accommodate differing appliance specifications while price, stock, publication status, identity, and category are relational fields. Publication filters apply to listing, detail, comparison, basket lookup, counts, and the export.

Basket storage contains product IDs and quantities. The server ignores browser-supplied prices and checks product publication and current stock. Quotes are read-only. There is no customer or staff role yet, so no claim of implemented private-data isolation beyond exclusion of unpublished records.

The static frontend has no direct database access. The backend connects to shared Neon PostgreSQL; connection credentials and fixtures stay outside public assets. The public corpus is a development artifact, not a public download route. Regenerate it after reviewed data changes. Initial version: `mart-1.0`. Every retrieval section is data, never an instruction source.

## Why this supports the security research

The richer catalog supplies grounded questions about compatibility, comparisons, stock, exclusions, and product policies. Volume alone does not establish a vulnerability or improve scanner coverage. Meaningful tests also require explicit trust boundaries, authorized tool behavior, controlled scenarios, and known expected outcomes.

Future assistant sources should remain separate:

| Source | Intended access | Grounding |
| --- | --- | --- |
| Products and general help | Public | Product/article IDs and source URLs |
| Customer orders and tickets | Authenticated owner | Server-derived user identity and ownership checks |
| Staff notes and operational settings | Authorized staff only | Explicit role checks; excluded from public retrieval |
| Scenario canaries and hidden-context fixtures | Isolated research scenarios | Synthetic markers, versioned scenario IDs and expected results |

Do not embed entire databases, credentials, hidden prompts, or staff tables into the public corpus. Retrieval authorization must run before content reaches a model. The LLM should not decide whether a user is authorized to access a record. The public site stays in its safe baseline; deliberately vulnerable modes belong in isolated, explicit scenarios.

## Next iterations

1. **Simulated transactions and identity:** registration/sign-in, controlled customer fixtures, server-owned carts, demo checkout with no payment gateway, inventory rules, and order history. Verify ownership and idempotency.
2. **Support and staff:** tickets, order-linked requests, bounded staff workflows, and separate public/private notes.
3. **LLM integration:** provider adapter, public retrieval, authorized order/support tools, citations, tool-call logging, token/cost limits, and refusal/error behavior. Decide the model and embedding provider when implementing this module.
4. **Scanner target scenarios:** versioned LLM08 Hidden Context Exposure tests with synthetic canaries and deterministic expected outcomes; safe and explicitly vulnerable configurations in isolated runs.

Review this catalog iteration before starting the next module. Full hosted production readiness still requires deployment operations, security review, backup/restore verification, and performance testing against a defined workload.
