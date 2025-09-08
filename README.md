# Flex Living Reviews Dashboard

A modern dashboard for property managers to assess and manage guest reviews across Flex Living properties.

[![Live Demo](https://img.shields.io/badge/Demo-Live-green?style=for-the-badge)](https://flexliving-reviews-dashboard-two.vercel.app/)


## Features

- **Hostaway Reviews Integration:**  
	Fetches live reviews from Hostaway API when available, with fallback to mock data for reliability.

- **Google Reviews Integration:**  
	Managers can fetch and display Google reviews for properties with a single click. Easily extensible by adding property name/ID pairs.

- **Manager Dashboard:**  
	- Per-property performance metrics  
	- Advanced filtering by rating, category, channel, and time  
	- Trend analysis and recurring issue detection  
	- Modular, reusable UI components

- **Review Approval Workflow:**  
	Managers select which reviews are displayed publicly, with approval status reflected in property detail pages.

- **AI-Powered Insights (Built-in):**  
  LLM-based sentiment analysis, aspect/theme extraction, and automatic recurring-issue detection across properties.


## Tech Stack

- Next.js (React, TypeScript)
- Tailwind CSS
- Radix UI
- Hostaway API, Google Places API
- Supabase (future extensibility)


## Getting Started

1. **Clone the repository:**
	 ```bash
	 git clone https://github.com/r4stin/flexliving-reviews-dashboard.git
	 cd flexliving-reviews-dashboard
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
	 Visit [http://localhost:3000](http://localhost:3000/) for properties rating, and[http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the dashboard.


