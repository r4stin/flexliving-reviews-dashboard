
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

1. **Clone the repository:**
	 ```bash
	 git clone https://github.com/r4stin/reviews-dashboard.git
	 cd reviews-dashboard
	 ```

2. **Install dependencies:**
	 ```bash
	 pnpm install
	 ```

3. **Configure environment variables:**
	 Create a `.env.local` file:
	 ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    HOSTAWAY_ACCOUNT_ID=your_hostaway_account_id
    HOSTAWAY_API_KEY=your_hostaway_api_key
    AI_PROVIDER=your_ai_provider
    OPENROUTER_API_KEY=your_openrouter_api_key
    GOOGLE_MAPS_API_KEY=your_google_maps_api_key
	 ```

4. **Start the development server:**
	 ```bash
	 pnpm dev
	 ```
	 Visit [http://localhost:3000](http://localhost:3000/) for properties rating, and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the dashboard.




---

## 📜 License

MIT
