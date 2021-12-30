# Rufuf API

> A blazing-fast REST API for **Rufuf (رفوف)** — a marketplace where renters lease physical
> racks/shelves to display and sell their products. Built with **Node.js**, **Fastify**,
> **MongoDB/Mongoose** and documented for the whole team.

The service powers three surfaces from a single API: the **customer apps** (browse, favorite,
order, rate), the **renter portal** (list products, lease racks, track payments) and the
**admin dashboard** (catalog, reservations, reporting, CMS content).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Modules Overview](#modules-overview)
- [Background Jobs](#background-jobs)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🔐 **JWT authentication** with token refresh for users, renters and admins.
- 🛍️ **Full marketplace flow** — catalog, orders, ratings/comments, coupons and favorites.
- 🗄️ **Rack & reservation management** — lease shelves, renew, and auto-close expired rentals.
- 📊 **Analytics & reporting** — KPIs, best sellers, top renters, and revenue/order time series.
- 🧩 **CMS-style reference data** — cities, contracts, delivery slots, static pages and settings.
- 📷 **Media uploads** via Cloudinary and 📩 **SMS/email** notifications (Msegat + Nodemailer).
- 📄 **Excel exports** for renters, orders, reservations and active products.
- ⏰ **Scheduled jobs** for finalizing expired rack rentals.

## Tech Stack

| Concern          | Technology                                   |
| ---------------- | -------------------------------------------- |
| Runtime          | Node.js                                      |
| Web framework    | [Fastify](https://www.fastify.io/)           |
| Database         | MongoDB via [Mongoose](https://mongoosejs.com/) |
| Auth             | JSON Web Tokens (`jsonwebtoken`)             |
| File uploads     | `fastify-file-upload` + Cloudinary           |
| Email            | Nodemailer (SMTP) + EJS templates            |
| SMS              | Msegat gateway                               |
| Config           | `config` + `dotenv`                          |
| Scheduling       | `node-cron`                                  |

## Architecture

```
        ┌──────────────┐      ┌───────────────┐      ┌──────────────┐
        │  Customer app │      │ Renter portal │      │ Admin dash   │
        └──────┬───────┘      └───────┬───────┘      └──────┬───────┘
               └──────────────────────┼─────────────────────┘
                                      │ HTTP (REST)
                              ┌───────▼────────┐
                              │    Fastify     │  index.js
                              │  routes/       │  route table → controllers
                              └───────┬────────┘
                    auth middleware ──┤ (controllers/auth.js — JWT)
                              ┌───────▼────────┐
                              │  Controllers   │  request handlers (this repo's core)
                              └───────┬────────┘
                              ┌───────▼────────┐   ┌──────────────┐
                              │    Models      │──▶│   MongoDB    │
                              └───────┬────────┘   └──────────────┘
                                      │
                              ┌───────▼────────┐
                              │  utils/utils   │  crypto · SMS · email · uploads
                              └────────────────┘
```

Requests enter through `index.js`, which registers Fastify plugins, connects to MongoDB and
loads the route table from `routes/index.js`. Each route delegates to a **controller** handler;
controllers read/write **models** and lean on **`utils/utils.js`** for cross-cutting concerns
(cryptography, messaging, uploads, contract numbering).

## Project Structure

```
rufuf_api/
├── index.js              # App entry point: Fastify setup, DB connection, server bootstrap
├── routes/
│   └── index.js          # Central route table mapping HTTP routes → controller handlers
├── controllers/          # Request handlers (documented per-module — see below)
│   ├── auth.js           # JWT verification middleware
│   ├── userController.js
│   ├── renterController.js
│   ├── adminController.js
│   ├── productController.js
│   ├── rackController.js
│   ├── orderController.js
│   ├── constantController.js
│   ├── reportController.js
│   ├── advController.js
│   ├── couponController.js
│   ├── favoriteController.js
│   └── notificationController.js
├── models/               # Mongoose schemas (User, Renter, Product, Rack, Order, ...)
├── utils/
│   └── utils.js          # Shared helpers: crypto, SMS, email, uploads, transactions
├── config/               # `config` package files + Swagger options
├── emails/               # EJS/HTML email templates
├── uploads/              # Uploaded media staging area
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** and **npm**
- A running **MongoDB** instance (local or hosted)

### Installation

```bash
# clone the repository
git clone <your-remote-url> rufuf_api
cd rufuf_api

# install dependencies
npm install
```

## Configuration

The app reads secrets from a `.env` file at the project root (loaded via `dotenv`):

| Variable        | Description                                            |
| --------------- | ------------------------------------------------------ |
| `DB_HOST`       | MongoDB connection string used by Mongoose.            |
| `jwtPrivateKey` | Secret key used to sign and verify JWT access tokens.  |
| `PORT`          | Port for the HTTP server (defaults to `3000`).         |

Example `.env`:

```env
DB_HOST=mongodb://localhost:27017/rufuf
jwtPrivateKey=super-secret-signing-key
PORT=3000
```

Additional non-secret configuration lives under `config/` (`default.json`,
`custom-environment-variables.json`) and is consumed through the `config` package.

> ⚠️ **Security note:** never commit real credentials. Third-party keys (Cloudinary, SMTP,
> SMS gateway) should be moved into environment variables rather than hard-coded.

## Running the Server

```bash
# start with hot reload (nodemon)
npm start
```

The API listens on `0.0.0.0:${PORT || 3000}`. On boot it connects to MongoDB and kicks off the
rack-rental cleanup job (see [Background Jobs](#background-jobs)).

## Modules Overview

Every controller and the shared utils module carries a JSDoc header describing its purpose and
listing its exposed handlers. High-level responsibilities:

| Module                       | Responsibility                                                        |
| ---------------------------- | --------------------------------------------------------------------- |
| `controllers/auth`           | JWT verification middleware; attaches `request.user`.                 |
| `controllers/userController` | Customer accounts: registration, login, OTP verify, profile, search.  |
| `controllers/renterController` | Renter onboarding, login, verification codes, profiles, exports.    |
| `controllers/adminController`  | Back-office admin accounts and authentication.                      |
| `controllers/productController`| Catalog: categories, products, images, pricing, approvals, transfer.|
| `controllers/rackController`   | Racks and reservations; availability, search and expiry sweeps.     |
| `controllers/orderController`  | Orders, ratings/comments, payments log and order reports.           |
| `controllers/constantController` | Reference data & CMS: cities, contracts, settings, static pages.  |
| `controllers/reportController` | Analytics: KPIs, top sellers/renters, revenue and growth trends.    |
| `controllers/advController`    | Promotional adverts/banners CRUD.                                   |
| `controllers/couponController` | Discount coupons CRUD and checkout validation.                      |
| `controllers/favoriteController` | Customer favorites list.                                          |
| `controllers/notificationController` | In-app notifications.                                         |
| `utils/utils`                | Crypto, SMS, email, Cloudinary uploads, transactions, contract no.    |

## Background Jobs

- **`rackController.FinishingRentRacks`** — invoked at server start (and intended to run on a
  schedule) to finalize rack reservations whose rental period has expired.

## Contributing

1. Create a feature branch off the default branch.
2. Keep controller handlers small and lean on `utils/utils.js` for shared logic.
3. Update the module's JSDoc header when you add or rename an exposed handler.
4. Open a pull request describing the change.

## License

Released under the terms of the [ISC License](./LICENSE).
