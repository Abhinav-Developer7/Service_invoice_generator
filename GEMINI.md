# MERN Invoice Generator --- Frontend and Backend Engineering Rules

These rules define the development standards for the company service
invoice generator. Follow them for every new feature, bug fix, refactor,
and deployment change.

## 1. General Engineering Principles

-   Follow clean code, separation of concerns, and single-responsibility
    principles.
-   Keep frontend and backend in separate directories and deploy them
    independently.
-   Use a modular, feature-oriented architecture that matches the
    existing project structure.
-   Reuse components, services, utilities, hooks, and middleware instead
    of duplicating code.
-   Follow consistent naming conventions and formatting.
-   Do not add dependencies unless they provide a clear benefit.
-   Do not rewrite working modules or change architecture without a
    clear requirement.
-   Implement one feature at a time and test it before moving forward.
-   Do not use mock data for production functionality; connect features
    to real APIs.
-   Handle loading, empty, validation, success, and error states.
-   Never claim a feature is complete without testing it.
-   If requirements are unclear, identify the missing decision before
    making assumptions that affect data, security, or invoice
    calculations.

## 2. Frontend Engineering Rules

### 2.1 React architecture

-   Use functional components and React Hooks.
-   Keep components focused on one responsibility.
-   Separate pages, reusable UI components, API calls, hooks, and
    utilities.
-   Keep business rules and complex calculations out of presentation
    components.
-   Extract repeated logic into custom hooks or utilities when
    appropriate.
-   Avoid giant components. Split a component when it handles multiple
    unrelated responsibilities.
-   Avoid unnecessary state. Derive values from existing state where
    possible.
-   Use stable, meaningful keys when rendering lists.
-   Do not mutate React state directly.
-   Do not use `useEffect` for values that can be calculated during
    rendering; use `useMemo` only when memoization is beneficial.
-   Clean up subscriptions, timers, and event listeners created by
    effects.
-   Do not suppress React warnings without understanding the cause.

### 2.2 Folder and naming conventions

-   Use PascalCase for React component filenames and component names,
    for example `InvoiceForm.jsx`.
-   Use camelCase for functions, variables, hooks, and utility files
    where consistent with the project, for example
    `calculateInvoiceTotals.js`.
-   Custom hooks must start with `use`, for example `useInvoices.js`.
-   Use clear, domain-specific names; avoid vague names such as `data`,
    `temp`, or `handleStuff`.
-   Follow the existing folder structure instead of creating competing
    structures.
-   Keep shared components in the common components area and
    feature-specific components close to their feature.

### 2.3 UI and styling

-   Reuse the established design system, colors, spacing, typography,
    buttons, form controls, tables, and modal patterns.
-   Do not introduce a second styling framework without approval.
-   Keep styling modular and avoid broad selectors that unexpectedly
    affect unrelated pages.
-   Build responsive layouts for desktop, tablet, and mobile.
-   Use semantic HTML and accessible form labels.
-   Ensure keyboard navigation, visible focus states, and sufficient
    color contrast.
-   Use consistent loading indicators, confirmation dialogs,
    notifications, and empty states.
-   Do not use browser alerts as the default application notification
    system.
-   Do not hard-code company-specific details throughout multiple
    components; use a shared company configuration or backend-provided
    settings.

### 2.4 Forms and validation

-   Use controlled form state or the project's established form library
    consistently.
-   Validate required fields, data types, dates, quantities, and user
    input.
-   Display clear, field-specific validation messages.
-   Prevent duplicate submissions while a request is processing.
-   Preserve user-entered values when a recoverable API error occurs.
-   Never rely on frontend validation alone; the backend must validate
    all data again.
-   For invoice items, validate positive quantities, valid prices,
    descriptions, discounts, and tax configuration.

### 2.5 API communication

-   Centralize Axios configuration in one API client.
-   Read the API base URL from environment variables.
-   Do not scatter hard-coded backend URLs throughout components.
-   Keep API request functions in feature-specific API modules.
-   Handle network failures, unauthorized responses, validation errors,
    and server errors consistently.
-   Use request cancellation or stale-response protection where it
    matters.
-   Do not call APIs repeatedly because of poorly configured effects.
-   Never expose database credentials, JWT signing secrets, or other
    backend secrets in frontend code.
-   Do not treat hiding a button or route as sufficient authorization;
    the backend must enforce access rules.

### 2.6 Routing and authentication

-   Use a centralized route configuration.
-   Protect authenticated pages with a shared route guard.
-   Redirect unauthenticated users to login.
-   Keep login and logout behavior consistent across the application.
-   Clear relevant client authentication state on logout.
-   Handle expired sessions and unauthorized API responses gracefully.
-   Prefer secure, HttpOnly cookies for session or refresh-token
    handling where suitable. Do not store long-lived tokens in
    localStorage.
-   If access tokens are used in memory, implement refresh and session
    renewal according to the selected authentication design.
-   Never put passwords, tokens, or sensitive customer information in
    URLs or logs.

### 2.7 Invoice-specific frontend rules

-   Treat backend-calculated invoice totals as authoritative.
-   Client-side calculations may provide an instant preview, but must
    match the backend's documented rounding rules.
-   Use a consistent currency and date formatting utility.
-   Keep invoice form data separate from display-only formatting.
-   Do not generate or finalize invoice numbers independently in the
    browser.
-   Load project details from the API and allow users to verify customer
    information before saving.
-   Clearly distinguish draft, issued, paid, overdue, and cancelled
    states.
-   Do not allow UI controls to bypass the rules for editing or deleting
    issued invoices.
-   Preview and PDF output must represent the saved invoice data
    accurately.
-   Warn users before navigating away from an invoice form with unsaved
    changes, where practical.

## 3. Backend Engineering Rules

### 3.1 Architecture and separation of concerns

-   Use Node.js and Express with a modular MVC-style architecture.
-   Keep route definitions, controllers, services, models, validators,
    and middleware separate.
-   Routes define endpoints and attach middleware.
-   Controllers parse requests and shape responses.
-   Services contain reusable business logic and orchestration.
-   Models define database schemas, indexes, and persistence behavior.
-   Validators validate request inputs before business logic runs.
-   Middleware handles authentication, authorization, request limits,
    and centralized errors.
-   Do not place the entire business workflow in route handlers.
-   Avoid unnecessary abstraction; add a service layer where business
    logic benefits from it.

### 3.2 Naming and code style

-   Use consistent JavaScript module conventions across the backend.
-   Use descriptive names such as `createInvoice`, `getInvoiceById`, and
    `calculateInvoiceTotals`.
-   Use `async/await` for asynchronous operations unless another
    approach is clearer.
-   Avoid deeply nested conditionals; use early returns where
    appropriate.
-   Avoid duplicated database queries and repeated business rules.
-   Do not use broad empty `catch` blocks or silently swallow errors.
-   Remove unused imports, dead code, debug logs, and commented-out
    implementations before merging.
-   Keep comments focused on why a non-obvious decision exists, not on
    restating the code.

### 3.3 API design

-   Use RESTful resource names and consistent HTTP methods.
-   Use `POST` for creation, `GET` for retrieval, `PATCH` for partial
    updates, and `DELETE` only where deletion is permitted.
-   Return appropriate HTTP status codes.
-   Use a consistent response format for success and errors.
-   Validate route parameters, query parameters, and request bodies.
-   Use pagination and filtering for potentially large lists.
-   Do not expose stack traces or internal database details to clients
    in production.
-   Avoid returning full database documents when the frontend only needs
    selected fields.
-   Document required fields, optional fields, filters, and error
    responses for each endpoint.

A recommended response convention is:

``` json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {}
}
```

For errors:

``` json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

Adapt the shape to the existing API if one is already established; do
not mix incompatible formats across endpoints.

### 3.4 Validation and error handling

-   Validate all incoming data on the backend.
-   Use schema validation such as Zod or express-validator consistently.
-   Validate MongoDB ObjectIds before querying records by ID.
-   Confirm that referenced projects and users exist and are eligible
    for the requested operation.
-   Handle duplicate-key errors, validation errors, missing records,
    authentication failures, and unexpected server errors explicitly.
-   Use centralized error middleware.
-   Do not expose passwords, tokens, database URIs, internal stack
    traces, or sensitive customer data in error messages.
-   Return client-safe messages while retaining useful server-side
    diagnostics.
-   Reject invalid status transitions rather than silently accepting
    them.

### 3.5 Authentication and authorization

-   Hash passwords with bcrypt or Argon2 before storing them.
-   Never store or log plain-text passwords.
-   Normalize email addresses and enforce a unique database index.
-   Use a well-defined access-token/session and refresh-token strategy.
-   Keep signing secrets in environment variables and use strong
    production secrets.
-   Set token/session expiration and implement logout/revocation where
    required by the design.
-   Protect every private API route with authentication middleware.
-   Check authorization on the backend for every protected operation.
-   If roles are introduced, enforce role and resource ownership checks
    on the server.
-   Add login rate limiting and reasonable request-size limits.
-   Configure CORS to allow only approved origins.
-   Use HTTPS in production.
-   Consider CSRF protection when using cookie-based authentication.
-   Do not assume a protected frontend route secures the API.

### 3.6 MongoDB and Mongoose

-   Define schemas with appropriate types, required fields, enums,
    defaults, and validation.
-   Add indexes for unique values and commonly queried fields.
-   Use a unique index for invoice numbers and user emails.
-   Handle duplicate-key errors; schema declarations alone are not a
    substitute for handling database index conflicts.
-   Avoid unbounded queries; paginate large lists.
-   Select only required fields when returning records.
-   Use `.lean()` for read-only queries when it is appropriate.
-   Avoid N+1 query patterns and unnecessary population.
-   Use transactions when multiple related database operations must
    succeed or fail together and the MongoDB deployment supports them.
-   Do not store secrets in database records unless there is a clear,
    secure need.
-   Never assume client-supplied IDs or references are valid.
-   Keep database connection configuration centralized.
-   Do not start accepting requests until required startup dependencies,
    including the database, are ready.

### 3.7 Invoice business logic and data integrity

-   Calculate invoice totals on the backend.
-   Never trust `subtotal`, `taxAmount`, `totalAmount`, or line-item
    amounts submitted by the client.
-   Recalculate line amounts from validated quantity and unit price.
-   Define and consistently apply rounding rules.
-   Use an appropriate decimal or integer-minor-unit strategy for
    monetary values; avoid uncontrolled floating-point arithmetic.
-   Generate invoice numbers on the backend using a concurrency-safe
    strategy.
-   Enforce invoice-number uniqueness in MongoDB.
-   Do not generate invoice numbers by simply counting existing
    invoices.
-   Snapshot customer and company details on each invoice to preserve
    historical accuracy.
-   Define permitted invoice status transitions.
-   Prevent direct deletion or silent editing of issued or paid invoices
    where company policy or accounting rules require traceability.
-   Record who created or changed important records.
-   If partial payments are supported, track payment records or amount
    paid and calculate outstanding balances consistently.
-   If tax support is required, implement the applicable tax rules
    explicitly and verify them with the company's accountant.
-   Do not combine amounts from different currencies into one total
    without a documented conversion policy.

### 3.8 Dashboard and reporting

-   Calculate dashboard values from the database or a reliable
    aggregation/service layer.
-   Define what counts as a project, invoice, issued amount, and
    outstanding balance.
-   Use the same status rules across the dashboard, history page, and
    reports.
-   Exclude drafts and cancelled invoices from invoiced totals when that
    matches the agreed business definition.
-   Avoid expensive aggregation on every request when the dataset
    becomes large; measure performance before adding caching or
    pre-aggregation.
-   Add indexes that support actual dashboard queries.

## 4. Environment and Configuration Rules

-   Keep separate environment configurations for local development,
    testing, and production.
-   Commit `.env.example` with placeholder values, never real secrets.
-   Add `.env`, credentials, private keys, and generated sensitive files
    to `.gitignore`.
-   Validate required environment variables at application startup.
-   Keep frontend variables limited to values safe for the browser, such
    as a public API base URL.
-   Keep database URIs, token secrets, email credentials, and private
    API keys on the backend.
-   Never use a production database accidentally during local tests.
-   Use separate database credentials with least-privilege access.
-   Document required environment variables in the README.

## 5. Testing Rules

-   Test authentication success and failure paths.
-   Test access restrictions for private endpoints.
-   Test project creation, listing, update, and deletion/archive
    behavior.
-   Test invoice calculations, rounding, tax rules, and invalid inputs.
-   Test invoice-number uniqueness under concurrent requests where
    practical.
-   Test invoice lifecycle rules, including draft, issued, paid,
    overdue, and cancelled states as implemented.
-   Test dashboard calculations against known database fixtures.
-   Test API error responses and missing records.
-   Test the UI's loading, empty, validation, and server-error states.
-   Add regression tests for every significant bug fix.
-   Do not use production customer data in automated tests.
-   Run linting, relevant automated tests, and a production build before
    merging.

## 6. Git and Code Review Rules

Use the agreed branch workflow:

``` text
production
   ^
developer
   ^
feature/<short-feature-name>
```

-   Create feature branches from `developer`.
-   Keep each branch focused on one feature or bug fix.
-   Use clear commit messages, for example
    `feat: add invoice creation API`.
-   Do not commit `.env` files, credentials, build artifacts, or
    unrelated changes.
-   Review the diff before committing and before merging.
-   Test the feature locally and verify that existing features still
    work.
-   Merge feature branches into `developer` through a pull request where
    practical.
-   Merge `developer` into `production` only after integration checks
    pass.
-   Never force-push shared branches without coordination.
-   Do not delete or overwrite user work while fixing a bug.

## 7. Bug Fix and Change Management Rules

Before modifying code:

1.  Inspect the existing folder structure and relevant files.
2.  Understand the current data flow and API contract.
3.  Reproduce or clearly identify the bug.
4.  Identify the smallest safe change.
5.  Check whether the change affects other modules.

After modifying code:

1.  Explain which files changed and why.
2.  Run relevant tests, linting, or builds.
3.  Verify the feature manually when needed.
4.  Check that existing routes, schemas, and API contracts remain
    compatible.
5.  Update documentation or environment examples when required.

Never silently rename files, replace a working architecture, remove
features, change database fields, or alter invoice calculations without
checking the impact.

## 8. Performance and Maintainability

-   Use pagination for invoice and project history.
-   Add indexes based on real query patterns.
-   Avoid unnecessary React re-renders, API requests, and database
    queries.
-   Use memoization only when it provides a measurable or clear benefit.
-   Keep API responses appropriately sized.
-   Avoid premature caching and complicated state management.
-   Prefer simple, testable implementations over clever but opaque code.
-   Add logging and monitoring suitable for production without logging
    sensitive information.
-   Establish a backup and recovery procedure for MongoDB.
-   Keep dependencies updated through controlled changes and test after
    upgrades.

## 9. Accessibility and User Experience

-   Use semantic HTML and accessible labels.
-   Support keyboard navigation and visible focus.
-   Provide clear validation messages and meaningful error feedback.
-   Confirm destructive actions.
-   Show loading states while requests are pending.
-   Provide useful empty states when no projects or invoices exist.
-   Disable submit actions during in-flight requests to reduce duplicate
    submissions.
-   Ensure tables and invoice previews remain usable on smaller screens.
-   Format dates and currency consistently.
-   Ensure invoice PDFs are legible and do not clip important
    information.

## 10. Definition of Done for Every Feature

A feature is complete only when:

-   [ ] The implementation follows the existing architecture.
-   [ ] Frontend and backend validation are implemented where
    applicable.
-   [ ] Authentication and authorization requirements are enforced.
-   [ ] Loading, empty, success, and error states are handled.
-   [ ] Relevant tests pass.
-   [ ] No secrets or sensitive information are exposed.
-   [ ] Existing functionality has not regressed.
-   [ ] The code is readable and does not duplicate existing logic.
-   [ ] Documentation and environment examples are updated when
    necessary.
-   [ ] The feature has been verified in the intended environment.

## 11. Rules for AI Coding Assistants

When using Antigravity or another AI coding assistant:

1.  Inspect the existing repository before proposing changes.
2.  Read the relevant files and follow established conventions.
3.  Present a short implementation plan for changes that affect multiple
    files or data models.
4.  Make focused changes instead of rewriting entire files
    unnecessarily.
5.  Do not invent existing APIs, schemas, environment variables, or file
    paths.
6.  Do not hard-code credentials, invoice totals, invoice numbers, or
    production URLs.
7.  Do not replace real API integration with mock data unless explicitly
    requested for a prototype or test.
8.  Explain any new dependency and why it is needed.
9.  Run available checks and report exactly what passed or failed.
10. Clearly identify any manual setup or testing that remains.
11. Ask before making destructive changes or changing a business rule.
12. Preserve existing user changes and avoid unrelated formatting or
    refactoring.

## 12. Project-Specific Priorities

For this invoice generator, prioritize work in this order:

1.  Secure authentication and application layout.
2.  Project CRUD and data validation.
3.  Invoice schema, safe invoice numbering, and backend calculations.
4.  Invoice creation form and preview.
5.  Invoice history, search, filters, and pagination.
6.  PDF download and printing.
7.  Dashboard metrics backed by real database data.
8.  Testing, deployment, monitoring, and backups.

**Core principle:** Financial correctness, data integrity, security, and
traceability take priority over visual polish or rapid feature delivery.
