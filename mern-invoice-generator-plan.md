# MERN Stack Invoice Generator --- Project Plan

## 1. Project Overview

Build a production-ready MERN Stack application for managing company
service projects and generating professional invoices. The application
will include authentication, a dashboard, project management, invoice
creation, invoice history, PDF export, and logout.

### Core goals

-   Manage company projects and customer details.
-   Generate accurate, professional service invoices.
-   Browse, search, filter, and review invoice history.
-   Show reliable dashboard metrics calculated from MongoDB.
-   Protect company data with authentication and server-side validation.
-   Keep the frontend and backend separate for easier development and
    deployment.

## 2. Functional Modules

### 2.1 Authentication

-   Login using email and password.
-   Validate credentials on the backend.
-   Protect private frontend routes and API endpoints.
-   Maintain a secure authentication session.
-   Logout and clear the client-side session.
-   Use a controlled account-creation process; public registration is
    not required unless the business needs it.

### 2.2 Dashboard

-   Total project count.
-   Total invoice count.
-   Total invoiced amount.
-   Outstanding balance, if payment tracking is supported.
-   Recent invoice listing.
-   Invoice status summary.
-   Quick actions for creating an invoice and adding a project.

Dashboard metrics must be calculated from database records, not
hard-coded frontend values.

### 2.3 Create Invoice

-   Generate a unique invoice number on the backend.
-   Select a project and retrieve its associated details.
-   Enter or confirm customer information.
-   Enter issue date and due date.
-   Add one or more service line items.
-   Calculate quantities, unit prices, subtotal, discount, tax, and
    final total.
-   Preview the invoice before saving or issuing it.
-   Save the invoice to MongoDB.
-   Download the invoice as a PDF and/or print it.
-   Validate all fields and recalculate totals on the backend.

### 2.4 Invoice History

-   List all saved invoices.
-   Search by invoice number or customer.
-   Filter by date and invoice status.
-   View invoice details.
-   Download or print the invoice.
-   Edit or delete only when allowed by the invoice's status and company
    policy.
-   Use pagination for larger datasets.

### 2.5 Project Management

-   Create a project.
-   List all projects.
-   View individual project details.
-   Edit project information.
-   Delete or archive a project.
-   Search and paginate project listings.
-   Track project status and related invoices.

Avoid permanently deleting a project that has issued invoices attached.
Prefer archiving it or preventing deletion until dependencies are
resolved.

### 2.6 Logout and Session Management

-   Provide a logout option in the profile menu or sidebar.
-   Clear authentication state on the client.
-   Revoke the server session or refresh token when that mechanism is
    implemented.
-   Redirect the user to the login page.
-   Ensure protected pages and API requests reject unauthenticated
    users.

## 3. Recommended Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React + Vite            User interface

  Routing                 React Router            Page navigation and
                                                  protected routes

  Styling                 CSS or Tailwind CSS     Responsive interface

  API communication       Axios                   HTTP requests and
                                                  interceptors

  Icons                   Lucide React            Interface icons

  Backend                 Node.js + Express.js    REST API

  Database                MongoDB Atlas or        Persistent data
                          managed MongoDB         

  ODM                     Mongoose                Schemas, validation,
                                                  and queries

  Authentication          JWT or secure           User authentication
                          session-based           
                          authentication          

  Password security       bcrypt or Argon2        Password hashing

  PDF generation          PDFKit or a             Invoice PDF output
                          browser-based PDF       
                          solution                

  Validation              Zod or                  Request validation
                          express-validator       

  Testing                 Vitest and Supertest    Frontend and API
                                                  testing

  Deployment              Vercel/Netlify +        Separate frontend and
                          Render/VPS              backend hosting
  -----------------------------------------------------------------------

**Recommendation:** Start with React, Vite, plain CSS, Express, MongoDB,
and Mongoose. Add dependencies only when they provide a clear benefit.

## 4. Application Architecture

The frontend and backend should be separate applications that
communicate through REST APIs.

``` text
React Frontend
  ├── Login
  ├── Dashboard
  ├── Projects
  ├── Create Invoice
  └── Invoice History
          |
          | HTTPS / REST API
          v
Express Backend
  ├── Routes
  ├── Controllers
  ├── Services
  ├── Middleware
  └── Validators
          |
          v
MongoDB + Mongoose
  ├── Users
  ├── Projects
  └── Invoices
```

### Request flow

1.  The user logs in through the React frontend.
2.  The backend validates the credentials.
3.  The backend establishes the authentication session or issues tokens.
4.  React sends authenticated requests to private endpoints.
5.  Express middleware checks authentication and authorization.
6.  Controllers and services process the request.
7.  Mongoose reads or updates MongoDB.
8.  The backend returns a structured JSON response.

Keep business logic out of React components and avoid placing all
backend logic directly inside route files.

## 5. Database Design

The initial version can use three main collections: `users`, `projects`,
and `invoices`.

### 5.1 User model

``` js
{
  name: String,
  email: String,       // unique
  password: String,    // store a password hash, never plain text
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

Requirements:

-   Normalize email addresses before lookup.
-   Add a unique index for email.
-   Hash passwords before saving.
-   Never return the password hash in API responses.
-   Use a controlled account-creation process.

### 5.2 Project model

``` js
{
  projectCode: String, // unique
  name: String,
  clientName: String,
  clientEmail: String,
  description: String,
  serviceType: String,
  startDate: Date,
  endDate: Date,
  status: String,      // planned, active, completed, on_hold
  createdBy: ObjectId, // reference to User
  createdAt: Date,
  updatedAt: Date
}
```

Add required fields, enum validation, indexes, and date validation in
the Mongoose schema.

### 5.3 Invoice model

``` js
{
  invoiceNumber: String, // unique
  project: ObjectId,     // reference to Project
  client: {
    name: String,
    email: String,
    address: String,
    taxId: String
  },
  companySnapshot: {
    name: String,
    address: String,
    email: String,
    taxId: String,
    logo: String
  },
  issueDate: Date,
  dueDate: Date,
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number
  }],
  subtotal: Number,
  discount: Number,
  taxRate: Number,
  taxAmount: Number,
  totalAmount: Number,
  currency: String,
  status: String, // draft, issued, paid, overdue, cancelled
  notes: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

This is a planning schema; the actual implementation should include
complete validation, indexes, and consistent status transitions.

### Database design rules

-   Store invoice line items inside the invoice because they belong to
    that invoice.
-   Snapshot company and customer details on each invoice so later
    profile changes do not silently modify historical documents.
-   Calculate totals on the backend; do not trust totals sent by the
    browser.
-   Generate invoice numbers safely on the backend and enforce
    uniqueness in MongoDB.
-   Do not permanently delete projects linked to issued invoices.
-   Define how archived projects and cancelled invoices affect dashboard
    counts.
-   Use a consistent monetary rounding strategy. For high-accuracy
    financial calculations, consider storing amounts as integer minor
    units or using a decimal representation instead of relying on
    floating-point arithmetic.

## 6. Frontend Folder Structure

Use a feature-oriented structure that groups related pages and logic.

``` text
Frontend/
├── public/
│   └── logo.svg
├── src/
│   ├── api/
│   │   ├── axios.js
│   │   ├── authApi.js
│   │   ├── invoiceApi.js
│   │   ├── projectApi.js
│   │   └── dashboardApi.js
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── DataTable.jsx
│   │   │   └── Loader.jsx
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   └── invoices/
│   │       ├── InvoiceForm.jsx
│   │       ├── InvoicePreview.jsx
│   │       └── InvoiceItems.jsx
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   └── projects/
│   ├── hooks/
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── utils/
│   │   ├── currency.js
│   │   └── date.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
└── package.json
```

Guidelines:

-   Keep reusable UI elements in `components/common`.
-   Keep layout components separate from page-specific components.
-   Group feature-specific logic in `features`.
-   Keep API calls out of large page components where practical.
-   Avoid duplicating shared buttons, modals, forms, and tables.

## 7. Backend Folder Structure

Use a modular MVC-style structure with a service layer for business
logic.

``` text
Backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Invoice.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── projectRoutes.js
│   │   └── invoiceRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── projectController.js
│   │   └── invoiceController.js
│   ├── services/
│   │   ├── invoiceService.js
│   │   ├── projectService.js
│   │   └── dashboardService.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validateRequest.js
│   ├── validators/
│   ├── utils/
│   │   ├── generateInvoiceNumber.js
│   │   └── calculateInvoiceTotals.js
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
└── package.json
```

Use `app.js` to configure Express, middleware, and routes. Use
`server.js` to connect to the database and start the server.

## 8. REST API Plan

  ----------------------------------------------------------------------------------
  Method                  Endpoint                           Purpose
  ----------------------- ---------------------------------- -----------------------
  POST                    `/api/auth/login`                  Authenticate a user

  POST                    `/api/auth/logout`                 End the session or
                                                             revoke a refresh token

  GET                     `/api/auth/me`                     Get the authenticated
                                                             user

  GET                     `/api/dashboard/summary`           Get dashboard counts
                                                             and totals

  GET                     `/api/dashboard/recent-invoices`   Get recent invoices

  POST                    `/api/projects`                    Create a project

  GET                     `/api/projects`                    List projects with
                                                             pagination and search

  GET                     `/api/projects/:id`                Get one project

  PATCH                   `/api/projects/:id`                Update a project

  DELETE                  `/api/projects/:id`                Delete when permitted

  POST                    `/api/invoices`                    Create an invoice

  GET                     `/api/invoices`                    List and filter
                                                             invoices

  GET                     `/api/invoices/:id`                Get invoice details

  PATCH                   `/api/invoices/:id`                Update an invoice

  DELETE                  `/api/invoices/:id`                Delete an eligible
                                                             invoice

  GET                     `/api/invoices/:id/pdf`            Generate or download an
                                                             invoice PDF
  ----------------------------------------------------------------------------------

### List query parameters

Support appropriate query parameters such as:

-   `page`
-   `limit`
-   `search`
-   `status`
-   `startDate`
-   `endDate`

### API conventions

-   Return consistent JSON response shapes.
-   Use appropriate HTTP status codes.
-   Validate request bodies and route parameters.
-   Add centralized error handling.
-   Protect every private endpoint with authentication middleware.
-   Add authorization checks when multiple user roles are introduced.
-   Restrict invoice editing and deletion based on invoice status.

Issued or paid invoices may require cancellation or credit-note
workflows instead of direct deletion, depending on company policy and
accounting requirements.

## 9. Dashboard Metrics

Recommended dashboard cards:

1.  **Total Projects** --- all eligible projects, with archived-project
    treatment clearly defined.
2.  **Total Invoices** --- saved invoices, including drafts if that is
    the chosen business rule.
3.  **Total Invoiced** --- sum of eligible issued invoice totals,
    excluding drafts and cancelled invoices.
4.  **Outstanding Balance** --- unpaid invoice balances; support
    `amountPaid` if partial payments are implemented.
5.  **Recent Invoices** --- latest invoices sorted by creation date or
    issue date.
6.  **Invoice Status Summary** --- counts grouped by status.

### Important calculation rules

-   Calculate all dashboard metrics from database data.
-   Use the same business rules across the dashboard and invoice
    history.
-   If multiple currencies are supported, do not combine them into a
    single total without a conversion policy.
-   Consider indexes on commonly filtered fields such as invoice number,
    status, issue date, project, and creation date.

## 10. Invoice Creation Workflow

1.  **Select project:** Load the project and associated client details.
2.  **Enter invoice details:** Set issue date, due date, currency, and
    service line items.
3.  **Calculate totals:** Validate quantity, price, discount, and tax on
    the backend.
4.  **Preview invoice:** Render a professional, company-branded invoice.
5.  **Save invoice:** Generate a unique invoice number and persist the
    record.
6.  **Export PDF:** Download or print the saved invoice.

### Basic calculation formulas

``` text
Line amount = Quantity × Unit price
Subtotal = Sum of all line amounts
Taxable amount = Subtotal − Discount
Total = Taxable amount + Tax amount
```

The actual tax calculation must follow the company's applicable rules.
If the company operates in India, confirm whether GST is applicable and
whether CGST/SGST or IGST, GSTIN, place of supply, and other required
invoice particulars must be included. Confirm tax requirements with the
company's accountant.

### Invoice numbering

-   Generate invoice numbers on the backend.
-   Enforce uniqueness with a MongoDB unique index.
-   Avoid generating numbers solely by counting existing invoices,
    because concurrent requests can create duplicates.
-   Consider a dedicated counter collection or another atomic sequence
    strategy.
-   Define whether numbering resets by financial year.

### PDF requirements

-   Include company logo and contact details.
-   Include invoice number, issue date, and due date.
-   Include customer and project details.
-   Show line items, quantities, prices, tax, discount, and total.
-   Include payment instructions and notes if required.
-   Ensure the PDF matches the saved invoice data.

## 11. Security and Reliability Checklist

-   Hash passwords using bcrypt or Argon2.
-   Validate all incoming request bodies on the backend.
-   Protect private frontend routes and API endpoints.
-   Store production secrets in environment variables.
-   Use HTTPS and restrict CORS to approved frontend domains.
-   Prefer secure, HttpOnly cookies for session or refresh-token
    handling where appropriate; avoid storing long-lived authentication
    tokens in localStorage.
-   Add rate limiting to login endpoints.
-   Enforce unique invoice numbers in MongoDB.
-   Validate MongoDB ObjectIds and confirm records exist before
    modifying them.
-   Prevent unauthorized invoice access or modification.
-   Use centralized error handling.
-   Add audit fields or an audit log for changes to issued invoices.
-   Keep `.env` files out of Git and commit `.env.example` instead.
-   Back up the database and define a recovery procedure.
-   Avoid exposing stack traces or secrets in production responses.

## 12. Development Phases

### Phase 1 --- Requirements and UI planning

-   Confirm company details and invoice fields.
-   Confirm tax and currency rules.
-   Define invoice statuses and deletion/editing rules.
-   Define dashboard metric calculations.
-   Plan pages and shared UI components.
-   Finalize API contracts and database schemas.

### Phase 2 --- Backend foundation and authentication

-   Initialize Express.
-   Configure MongoDB and Mongoose.
-   Create the user schema.
-   Implement login and password hashing.
-   Implement authentication middleware.
-   Implement logout/session handling.
-   Add validation and centralized error handling.
-   Test authentication endpoints.

### Phase 3 --- Project CRUD

-   Create the project schema and indexes.
-   Implement create, list, details, update, and delete/archive
    endpoints.
-   Add search and pagination.
-   Add validation and deletion safeguards.
-   Test project APIs.

### Phase 4 --- Invoice engine

-   Create the invoice schema and indexes.
-   Implement safe invoice numbering.
-   Implement backend invoice calculations.
-   Implement invoice creation and retrieval.
-   Define update and cancellation rules.
-   Implement PDF generation.
-   Test calculations, numbering, and PDF output.

### Phase 5 --- Frontend integration

-   Build the shared application layout.
-   Implement login and protected routes.
-   Build project management pages.
-   Build the create-invoice form and preview.
-   Build invoice history, filters, and details.
-   Build the dashboard using real API data.
-   Add loading, empty, validation, and error states.
-   Make the UI responsive.

### Phase 6 --- Testing and deployment

-   Test authentication and access restrictions.
-   Test project CRUD and invoice workflows.
-   Verify totals, tax calculations, and invoice numbering.
-   Verify PDF layout and printing.
-   Test responsive layouts and error states.
-   Deploy the frontend and backend separately.
-   Configure production environment variables, CORS, HTTPS, and
    database access.
-   Verify all flows in production.
-   Configure backups and monitoring.

## 13. Git Workflow

Use a stable production branch and a development integration branch.

``` text
production
   ^
developer
   ^
feature/login
feature/project-crud
feature/create-invoice
feature/invoice-history
feature/dashboard
```

Recommended workflow:

1.  Create a feature branch from `developer`.
2.  Implement and test one feature.
3.  Push the feature branch and open a pull request into `developer`.
4.  Test the integrated application.
5.  Merge `developer` into `production` when the release is ready.
6.  Deploy production from the `production` branch.

Keep frontend and backend environment variables separate. Never commit
credentials or production secrets.

## 14. Definition of Done

### Authentication

-   [ ] Login validates credentials.
-   [ ] Private routes and APIs are protected.
-   [ ] Logout ends the session correctly.

### Projects

-   [ ] Create, view, edit, and delete or archive projects.
-   [ ] Search and pagination work.
-   [ ] Validation and deletion safeguards work.

### Invoices

-   [ ] Create an invoice with correct calculations.
-   [ ] Invoice numbers are unique.
-   [ ] Preview, PDF download, and printing work as required.
-   [ ] Invoice history filters and search work.
-   [ ] Issued invoice editing and deletion rules work.
-   [ ] Historical invoice details remain stable after project or
    company changes.

### Dashboard and deployment

-   [ ] Dashboard metrics match database records.
-   [ ] Loading, empty, and error states are handled.
-   [ ] Responsive layout works on mobile and desktop.
-   [ ] Production environment, HTTPS, CORS, and database connectivity
    are verified.
-   [ ] Database backup and recovery procedures are documented.

## 15. Decisions to Finalize Before Implementation

Confirm these decisions before finalizing schemas and forms:

1.  **Users:** Is this for one administrator/user, or will multiple
    employees need different permissions?
2.  **Invoice export:** PDF download only, browser printing only, or
    both?
3.  **Tax:** Indian GST support, simple invoices without automatic tax
    calculation, or another/custom tax setup?
4.  **Payment tracking:** Is invoice status enough, or do you need
    partial payments, payment dates, and outstanding balances?
5.  **Company settings:** Should the company logo, address, tax details,
    bank details, and payment terms be configurable?
6.  **Invoice lifecycle:** Can issued invoices be edited, or should
    corrections use cancellation/credit-note workflows?
7.  **Financial year numbering:** Should invoice numbers include the
    financial year?

## Final Recommendation

Build the application in small, testable features:

1.  Requirements and architecture.
2.  Database models and authentication.
3.  Project CRUD.
4.  Invoice creation and calculation engine.
5.  Invoice history and PDF generation.
6.  Dashboard integration.
7.  Testing, deployment, and security review.

Prioritize correctness, traceability, and data integrity over adding
features too early. Invoice calculations, unique numbering, historical
snapshots, and safe handling of issued invoices are especially important
for a company-facing application.
