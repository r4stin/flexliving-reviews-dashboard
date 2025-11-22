
# Reviews Dashboard

A unified dashboard for analyzing and managing Airbnb/Hostaway + Google reviews across multiple properties, with sentiment analysis, issue classification, AI-powered summaries, and a built-in review approval workflow backed by Supabase.

[![Live Demo](https://img.shields.io/badge/Demo-Live-green?style=for-the-badge)](https://reviews-dashboard-two.vercel.app/)
---

## 🚀 Features

### **Review Aggregation**
- Fetches reviews from **Hostaway API**
- Fetches reviews from **Google Places API**
- Merges & normalizes reviews into a consistent cross-platform schema
- Optional UI toggle to include/exclude Google reviews

### **Sentiment & Issue Analysis**
- Uses classical sentiment scoring (`sentiment` NPM package)
- Keyword-based issue taxonomy for categorization (cleanliness, communication, etc.)
- Tracks recurring issues, themes, wins, and trends across properties

### **AI Insights (Summaries Only)**
- LLM **summarizes issue statistics**
- Supports **OpenRouter** or **Groq** as the model provider


### **Manager Dashboard**
- Per-property analytics & summaries
- Filter by:
  - rating
  - channel (google / hostaway)
  - category
  - time window
- Trend charts & recurring issue breakdowns
- Drill-down views into individual reviews

### **Review Approval Workflow (Supabase-backed)**
- Persistent approval state stored in Supabase `approvals` table
- Approving/denying reviews controls:
  - Dashboard visibility
  - The app includes public-facing pages for each property at:

    ```
    /properties
    /properties/[slug]
    ```

    These pages **only display reviews that have been approved in Supabase**.  
    Unapproved reviews remain visible in the manager dashboard but do not appear publicly.

---

## 🛠 Tech Stack

| Feature | Technology |
|---------|------------|
| Frontend | Next.js (App Router) + Tailwind |
| Data Fetching | API Routes (Edge-compatible) |
| Hosting | Vercel recommended |
| Storage (Approvals) | **Supabase** (required for moderation workflow) |
| AI Provider | OpenRouter **or** Groq |
| Sentiment | `sentiment` npm package |
| Maps | Google Maps JS API (optional) |


---

## 🔧 Getting Started

Before running the app, create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
HOSTAWAY_ACCOUNT_ID=your_hostaway_account_id
HOSTAWAY_API_KEY=your_hostaway_api_key
AI_PROVIDER=your_ai_provider
OPENROUTER_API_KEY=your_openrouter_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

You can run the project **locally** or using **Docker**.

---

### **▶ Option 1: Run Locally**

1. **Clone the repository**
   ```bash
   git clone https://github.com/r4stin/reviews-dashboard.git
   cd reviews-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the dev server**
   ```bash
   pnpm dev
   ```

Open:

- http://localhost:3000 → Properties overview  
- http://localhost:3000/dashboard → Manager dashboard

---

### **🐳 Option 2: Run with Docker**

1. **Build the image**
   ```bash
   docker build -t reviews-dashboard .
   ```

2. **Run the container**
   ```bash
   docker run \
     --env-file .env.local \
     -p 3000:3000 \
     reviews-dashboard
   ```

Open:

- http://localhost:3000 → Properties overview  
- http://localhost:3000/dashboard → Manager dashboard

> Supabase variables are required at runtime. Missing values disable review-moderation features.

---


## 📜 License

MIT
