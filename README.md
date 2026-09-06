# 🚀 VoiceKhata

> AI-Powered Personal Finance Management Platform

VoiceKhata is a modern full-stack finance management platform focused on helping users track expenses, manage budgets, analyze spending habits, and generate AI-powered financial insights.

Built with scalability and user experience in mind, the platform combines modern web technologies with AI integration to simplify personal finance management.

---

<a href="https://voicekhata.tech/" target="_blank">
  <img width="1900" height="966" alt="VoiceKhata Dashboard" src="https://github.com/user-attachments/assets/8171d8d4-bdad-488f-aad2-dba2caa70d43" />
</a>

## ✨ Features

* 📊 Smart expense & income tracking
* 🤖 AI-powered financial insights
* 📈 Interactive analytics dashboard
* 🧾 Smart receipt scanner
* 💰 Budget monitoring system
* 🎯 Savings & investment tracking
* 🔔 AutoPay & recurring transaction tracking
* ⚡ Fast and responsive modern UI

---

## 🛠 Tech Stack

### Frontend

* Vite + React
* TypeScript
* Tailwind CSS

### Backend

* Node.js + Express

### Database & Storage

* Supabase (PostgreSQL)

### Authentication & Hosting

* Firebase

### AI Models

* Llama-3.1-8B-Instant
* Llama-4-Scout-17B-16E-Instruct
* GPT-OSS-120B

---

## 🗄 Database Schema

### Table: `alert_rules`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| name | text |
| condition | text |
| threshold | numeric |
| category | text |
| channel | text[] |
| enabled | boolean |
| created_at | timestamptz |

---

### Table: `budgets`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| category | text |
| amount | numeric |
| month | text |
| created_at | timestamptz |
| duration | text |

---

### Table: `gmail_tokens`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| access_token | text |
| refresh_token | text |
| expiry_date | bigint |
| created_at | timestamptz |

---

### Table: `manual_investments`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| name | text |
| type | text |
| amount_invested | numeric |
| expected_return | numeric |
| added_at | timestamptz |
| ticker | text |
| quantity | numeric |
| bought_price | numeric |
| current_price | numeric |
| bought_date | date |

---

### Table: `merchant_memory`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| raw_input | text |
| normalized_name | text |
| merchant_type | text |
| category | text |
| tags | text[] |
| confidence | numeric |
| created_at | timestamptz |
| updated_at | timestamptz |

---

### Table: `notification_prefs`

| Field | Type |
|---|---|
| firebase_uid | text |
| in_app | boolean |
| email | boolean |
| budget_alerts | boolean |
| transaction_alerts | boolean |
| ai_insights | boolean |
| system_alerts | boolean |
| quiet_hours_start | integer |
| quiet_hours_end | integer |
| updated_at | timestamptz |

---

### Table: `notifications`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| type | text |
| title | text |
| message | text |
| metadata | jsonb |
| read | boolean |
| created_at | timestamptz |

---

### Table: `processed_emails`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| gmail_id | text |
| processed_at | timestamptz |

---

### Table: `recurring_savings`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| label | text |
| amount | numeric |
| frequency | text |
| active | boolean |
| created_at | timestamptz |

---

### Table: `recurring_transactions`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| transaction | text |
| category | text |
| amount | numeric |
| type | text |
| method | text |
| frequency | text |
| start_date | date |
| next_run | date |
| active | boolean |
| created_at | timestamptz |
| end_date | date |

---

### Table: `savings_goals`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| name | text |
| target_amount | numeric |
| saved_amount | numeric |
| deadline | date |
| color | text |
| created_at | timestamptz |

---

### Table: `sip_plans`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| monthly_amount | numeric |
| duration_years | integer |
| expected_return | numeric |
| start_date | date |
| active | boolean |
| created_at | timestamptz |

---

### Table: `transactions`

| Field | Type |
|---|---|
| id | bigint |
| firebase_uid | text |
| transaction | text |
| category | text |
| amount | numeric |
| date | date |
| type | text |
| method | text |
| status | text |
| created_at | timestamptz |

---

### Table: `user_budget_caps`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| month | text |
| total_cap | numeric |
| created_at | timestamptz |

---

### Table: `user_profiles`

| Field | Type |
|---|---|
| id | uuid |
| firebase_uid | text |
| full_name | text |
| country | text |
| currency | text |
| monthly_income | numeric |
| income_source | text |
| savings_goal | numeric |
| financial_experience | text |
| dob | date |
| created_at | timestamptz |
| profile_pic | text |
| gmail_connected | boolean |

---

## 🚀 Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Mayank-23-Dev/VoiceKhata.git
cd VoiceKhata
```

---

### 2️⃣ Create Frontend `.env`

Create a `.env` file in the project root:

```env
# Firebase
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""

# Supabase
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""

# AI APIs
VITE_GEMINI_API_KEY=""
VITE_OPENROUTER_API_KEY=""
VITE_GROQ_API_KEY=""
NVIDIA_API_KEY=""

# Google Vision OCR
VITE_GOOGLE_VISION_API_KEY=""
VITE_GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Backend URL
VITE_BACKEND_URL=""
VITE_MERCHANT_SEARCH_ENDPOINT=""
```

⚠️ Never commit your `.env` file publicly.

---

### 3️⃣ Create Backend `.env`

Create another `.env` file inside `voicekhata-backend/`

```env
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""

SUPABASE_URL=""
SUPABASE_SERVICE_KEY=""

GROQ_API_KEY=""
TAVILY_API_KEY=""
BRAVE_SEARCH_API_KEY=""
PERPLEXITY_API_KEY=""

PORT=3001

FINNHUB_KEY=""
TWELVE_DATA_KEY=""
```

⚠️ Never expose backend API keys publicly.

---

### 4️⃣ Install Dependencies

```bash
npm install
```

---

### 5️⃣ Start Development Server

```bash
npm run dev
```

Frontend:
```txt
http://localhost:5173
```

Backend:
```txt
http://localhost:3001
```

---

## 📌 Roadmap

* Advanced AI financial analysis
* Multi-account integrations
* Investment portfolio analytics
* Smart financial recommendations
* Exportable reports
* Mobile application support

---

## 👨‍💻 Author

**Mayank Dev**  
BTech Student • Developer • Builder

GitHub: https://github.com/Mayank-23-Dev

---

## 🌐 Live Project

https://voicekhata.tech/

---

## 📄 License

This project is currently under active development.
