<h1 align="center" id="title">Expense Tracker App</h1>

<p id="description">This repository contains the backend code for an Expense Tracker application. The server is built using Node.js and Express.js and utilizes MongoDB as the database. The app provides functionality to manage budgets and expenses and requires user authentication to access certain routes. Sessions are stored in MongoDB.</p>

## Test Credentials

To explore you can use the following test credentials:

- **Email:** testuser@test.com
- **Password:** Pass@123

Feel free to sign in using these credentials to experience the platform's functionalities without creating a new account.

<h2>🛠️ Installation Steps:</h2>

<p>1. Clone the repository to your local machine:</p>

```
git clone https://github.com/yadavhrsit/ExpanseTracker-Backend
```

<p>2. Install the dependencies:</p>

```
npm install
```
<p>3. Set up environment variables:</p>
Create a .env file in the root directory and add the following environment variables:


```
PORT=8000
DB="mongodb+srv://your-mongodb-connection-string" 
SECRET="your-session-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

<p>4. Project Directory</p>

```
cd ExpanseTracker-Backend
```

<p>5. Start the server:</p>

```
npm start
```

<h2>API Response Format</h2>
<p>Every endpoint (including 404s, rate limiting and unexpected errors) returns JSON in the same envelope.</p>

**Success** (`2xx`)

```json
{
  "success": true,
  "message": "Budget added successfully",
  "data": { "budget": { "_id": "...", "name": "Monthly Expenses", "amount": 1000 } }
}
```

**Error** (`4xx` / `5xx`)

```json
{
  "success": false,
  "message": "Amount must be a number",
  "errors": [{ "field": "amount", "message": "Amount must be a number" }]
}
```

- `message` is always a human-readable string; `data` is only present on success when there is a payload; `errors` is only present for validation failures (`400`).
- Status codes used: `200` OK, `201` created, `400` validation / business rule failure, `401` not authenticated or bad credentials, `404` not found, `409` conflict (e.g. email already registered), `429` rate limited, `500` unexpected server error (internals are never leaked).
- Budgets and expenses are scoped to the logged-in user; another user's records return `404`.

<h2>API Endpoints:</h2>

All endpoints return the [common response envelope](#api-response-format). Endpoints marked 🔒 require a logged-in session and additionally return this when not authenticated:

```json
// 401
{ "success": false, "message": "Authentication required" }
```

Every endpoint under `/auth`, `/budget` and `/expense` can also return `429` when the rate limit is exceeded, and `500` for unexpected failures:

```json
// 429
{ "success": false, "message": "Too many requests from this IP, please try again later." }
// 500 (the message names the failed action; internals are never exposed)
{ "success": false, "message": "Internal Server Error" }
```

Validation failures (`400`) always look like this, where `message` is the first error:

```json
{
  "success": false,
  "message": "Amount must be a number",
  "errors": [{ "field": "amount", "message": "Amount must be a number" }]
}
```

<h3>Auth Routes</h3>

#### Register a new user
`POST /auth/register`

Request body:
```json
{ "name": "Your Name", "email": "user@example.com", "password": "your-password" }
```

Success `201`:
```json
{ "success": true, "message": "User registered successfully" }
```

Errors:
| Status | message |
|---|---|
| 400 | `Name is required` / `Invalid email format` / `Password must be at least 6 characters long` |
| 409 | `User already registered with this email` |
| 500 | `An error occurred during user registration` |

#### Login with existing user
`POST /auth/login`

Request body:
```json
{ "email": "user@example.com", "password": "your-password" }
```

Success `200` (also sets the session cookie):
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "userId": "64b1f0c2e4b0a1a2b3c4d5e6", "userName": "Your Name" }
}
```

Errors:
| Status | message |
|---|---|
| 400 | `Email is required` / `Password is required` |
| 401 | `Email is not registered` / `Incorrect password. Please try again` |
| 500 | `An error occurred during login` |

#### Logout
`GET /auth/logout`

Success `200`:
```json
{ "success": true, "message": "You've been signed out" }
```

Errors:
| Status | message |
|---|---|
| 500 | `An error occurred during logout` |

<h3>Utility Routes</h3>

#### Check email availability
`GET /utils/isemailavail/:email`

Success `200` (`available` is `false` when the email is already registered):
```json
{ "success": true, "message": "Email is available", "data": { "available": true } }
```

Errors:
| Status | message |
|---|---|
| 500 | `An error occurred while checking email availability` |

#### Get logged-in user 🔒
`GET /utils/getuser`

Success `200`:
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": { "userId": "64b1f0c2e4b0a1a2b3c4d5e6", "userName": "Your Name" }
}
```

<h3>Budget Routes</h3>

#### Add a new budget 🔒
`POST /budget/add`

Request body:
```json
{ "name": "Monthly Expenses", "amount": 1000 }
```

Success `201`:
```json
{
  "success": true,
  "message": "Budget added successfully",
  "data": {
    "budget": { "_id": "64b1f...", "user": "64b1e...", "name": "Monthly Expenses", "amount": 1000 }
  }
}
```

Errors:
| Status | message |
|---|---|
| 400 | `Name is required` / `Amount is required` / `Amount must be a number` |
| 409 | `A record with the same unique value already exists` (budget name is taken) |
| 500 | `An error occurred during the addition of the budget` |

#### Update an existing budget 🔒
`PATCH /budget/update`

Request body:
```json
{ "id": "budget-id", "amount": 1200 }
```

Success `200`:
```json
{
  "success": true,
  "message": "Budget updated successfully",
  "data": {
    "budget": { "_id": "budget-id", "user": "64b1e...", "name": "Monthly Expenses", "amount": 1200 }
  }
}
```

Errors:
| Status | message |
|---|---|
| 400 | `Budget ID is required` / `Invalid Budget ID` / `Amount is required` / `Amount must be a number` |
| 404 | `Budget not found` |
| 500 | `An error occurred during the update of the budget` |

#### Delete a budget 🔒
`DELETE /budget/delete`

Request body:
```json
{ "id": "budget-id" }
```

Success `200`:
```json
{ "success": true, "message": "Budget deleted successfully" }
```

Errors:
| Status | message |
|---|---|
| 400 | `Budget ID is required` / `Invalid Budget ID` |
| 404 | `Budget not found` |
| 500 | `Failed to delete the budget` |

#### View all budgets 🔒
`GET /budget/viewall?page=1&limit=10` (`page` and `limit` are optional, default `1` and `10`)

Success `200`:
```json
{
  "success": true,
  "message": "Budgets fetched successfully",
  "data": {
    "budgets": [{ "_id": "64b1f...", "user": "64b1e...", "name": "Monthly Expenses", "amount": 1000 }]
  }
}
```

Errors:
| Status | message |
|---|---|
| 400 | `Invalid page number` / `Invalid limit value` |
| 500 | `An error occurred while retrieving all the budgets` |

#### View a specific budget 🔒
`GET /budget/view/:budgetId`

Success `200`:
```json
{
  "success": true,
  "message": "Budget fetched successfully",
  "data": {
    "budget": { "_id": "64b1f...", "user": "64b1e...", "name": "Monthly Expenses", "amount": 1000 }
  }
}
```

Errors:
| Status | message |
|---|---|
| 400 | `Invalid Budget ID` |
| 404 | `Budget not found` |
| 500 | `Failed to retrieve the budget` |

<h3>Expense Routes</h3>

An expense's `category` is set to the name of its budget. The total of all expenses in a budget can never exceed the budget amount.

#### Add a new expense 🔒
`POST /expense/add`

Request body:
```json
{ "description": "Grocery Shopping", "amount": 50, "budgetId": "budget-id" }
```

Success `201`:
```json
{
  "success": true,
  "message": "Expense added successfully",
  "data": {
    "expense": {
      "_id": "64b2a...", "date": "2026-10-27T10:00:00.000Z", "description": "Grocery Shopping",
      "amount": 50, "budgetId": "budget-id", "user": "64b1e...", "category": "Monthly Expenses"
    }
  }
}
```

Errors:
| Status | message |
|---|---|
| 400 | `Description is required` / `Amount is required` / `Amount must be a positive number` / `Budget ID is required` / `Invalid Budget ID` / `Expense exceeds the budget` |
| 404 | `Budget not found` |
| 500 | `An error occurred during the addition of the expense` |

#### Update an existing expense 🔒
`PATCH /expense/update`

Request body (`description`, `amount` and `budgetId` are all optional):
```json
{ "expenseId": "expense-id", "description": "Grocery Shopping", "amount": 60, "budgetId": "new-budget-id" }
```

Success `200` (returns the updated expense, same shape as Add):
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "expense": {
      "_id": "expense-id", "date": "2026-10-27T10:00:00.000Z", "description": "Grocery Shopping",
      "amount": 60, "budgetId": "new-budget-id", "user": "64b1e...", "category": "New Budget Name"
    }
  }
}
```

Errors:
| Status | message |
|---|---|
| 400 | `Expense ID is required` / `Invalid Expense ID` / `Amount must be a positive number` / `Invalid Budget ID` / `Description should be maximum 100 words` / `Expense exceeds the budget` |
| 404 | `Expense not found` / `Budget not found` |
| 500 | `An error occurred during updating the expense` |

#### Delete an expense 🔒
`DELETE /expense/delete`

Request body:
```json
{ "expenseId": "expense-id" }
```

Success `200`:
```json
{ "success": true, "message": "Expense deleted successfully" }
```

Errors:
| Status | message |
|---|---|
| 400 | `Expense ID is required` / `Invalid Expense ID` |
| 404 | `Expense not found` |
| 500 | `An error occurred during deleting the expense` |

#### View all expenses 🔒
`GET /expense/viewall`

Query parameters (all optional):
- `sort=true&sortingCriteria=date|category|amount`
- `filter=true&filterCriteria[category]=Food&filterCriteria[amount-range]=10-100&filterCriteria[date-range]=<start>-<end>`
- `paginate=true&page=1&limit=10`

Success `200` without pagination:
```json
{
  "success": true,
  "message": "Expenses fetched successfully",
  "data": { "expenses": [{ "_id": "64b2a...", "description": "Grocery Shopping", "amount": 50, "category": "Monthly Expenses" }] }
}
```

Success `200` with `paginate=true` adds a `pagination` object:
```json
{
  "success": true,
  "message": "Expenses fetched successfully",
  "data": {
    "expenses": [ ... ],
    "pagination": { "currentPage": 1, "totalPages": 3, "totalEntries": 25, "limit": 10 }
  }
}
```

Errors:
| Status | message |
|---|---|
| 400 | `Invalid limit value` / `Invalid page number` / other invalid query values |
| 500 | `An error occurred during getting all the expenses` |

#### View a specific expense 🔒
`GET /expense/view/:expenseId`

Success `200`:
```json
{
  "success": true,
  "message": "Expense fetched successfully",
  "data": {
    "expense": {
      "_id": "64b2a...", "date": "2026-10-27T10:00:00.000Z", "description": "Grocery Shopping",
      "amount": 50, "budgetId": "64b1f...", "user": "64b1e...", "category": "Monthly Expenses"
    }
  }
}
```

Errors:
| Status | message |
|---|---|
| 400 | `Invalid Expense ID` |
| 404 | `Expense not found` |
| 500 | `An error occurred during opening the expense` |

<h2>User Password Encryption:</h2>
<p>
This application ensures the security of user passwords by encrypting them before storing in the database. Passwords are not stored in plain text; instead, they are hashed using a strong cryptographic hashing algorithm. This approach ensures that even if the database is compromised, user passwords remain secure and cannot be easily retrieved.
</p>

<h2>Authentication</h2>
<p>
The app uses Passport.js for user authentication and supports both local email-password authentication and Google Sign-In using OAuth2. 
To enable Google Sign-In, provide the Google Client ID and Google Client Secret in the .env file.
</p>

<h2>Rate Limiter</h2>
<p>The server implements rate limiting to protect against abuse and ensure fair usage of the API. The rate limiter has the following configuration:</p>

- `windowMs`: 15 minutes
- `max`: 100 requests per 15 minutes

This means that each IP address is limited to 100 requests within a 15-minute window. If a user exceeds the request limit, they will receive a 429 (Too Many Requests) error response for subsequent requests within the window.
The rate limiter middleware is applied to all API endpoints to prevent excessive requests and enhance the server's security and performance.

<h2>Transactions</h2>
<p>In this application, the management of expenses is performed with a strong emphasis on data integrity and security through the use of transactions. When users interact with their expenses, such as adding or updating them, the application employs a robust transactional approach to maintain consistency and reliability in the database.</p>

<h2>Session Management</h2>
<p>The app uses MongoDB for session storage to enhance performance and scalability. Session data is now stored in the same MongoDB database as other application data.</p>

<h2>Authorization and Security</h2>
<p>This application utilizes session-based authorization to protect budget and expenses routes. Only logged-in users can access these routes. Unauthorized requests will receive a 401 (Unauthorized) status code.

<h2>Express Validator</h2>
<p>The APIs are integrated with express-validator, which ensures that incoming requests are properly validated. This validation helps prevent potential security vulnerabilities and enhances the reliability of the application.</p>

<h2>Models</h2>
<p>The models folder contains the User, Budget, and Expense models used to interact with the database.</p>

<h2>Controllers</h2>
<p>The controllers folder contains the controllers for adding, updating, viewing, and deleting budgets and expenses. These controllers are used in the respective routes for handling different API requests.</p>

<h2>Database</h2>
<p>The app connects to a MongoDB database. Make sure to provide the MongoDB connection string in the .env file.</p>

