# BG Tracker — Bank Guarantee & EMD Management SaaS

Track all your EMDs, Performance BGs, and Bid Bonds. Get automatic email alerts before expiry.
Built for Indian construction companies bidding on government tenders.

---

## Tech Stack
- **Frontend + Backend**: Next.js 14 (App Router)
- **Database + Auth**: Supabase (PostgreSQL)
- **Email Alerts**: Resend
- **Payments**: Razorpay (subscriptions)
- **Hosting**: Vercel (with Cron Jobs for daily alerts)

---

## Setup — Step by Step

### Step 1: Clone and install
```bash
git clone <your-repo>
cd emd-tracker
npm install
```

### Step 2: Set up Supabase
1. Go to supabase.com → create new project
2. Go to SQL Editor → New Query
3. Paste the entire contents of `supabase-schema.sql` and click Run
4. Go to Settings → API → copy your Project URL and anon key

### Step 3: Set up Resend (free email)
1. Go to resend.com → sign up
2. Add and verify your domain (or use their sandbox for testing)
3. Go to API Keys → create key
4. Free plan: 3,000 emails/month (enough for ~300 customers)

### Step 4: Set up Razorpay
1. Go to razorpay.com → create account
2. Complete KYC (takes 1-2 days)
3. Dashboard → Subscriptions → Plans → Create Plan:
   - Plan name: BG Tracker Monthly
   - Billing amount: ₹2,999
   - Period: Monthly
   - Copy the Plan ID (starts with `plan_`)
4. Settings → API Keys → copy Key ID and Secret

### Step 5: Create .env.local
```bash
cp .env.local.example .env.local
```
Fill in all values from steps 2-4.

Add one more:
```
CRON_SECRET=any-random-long-string-you-make-up
RAZORPAY_PLAN_ID=plan_xxxxxxxxxx
```

### Step 6: Run locally
```bash
npm run dev
```
Open http://localhost:3000 — sign up, add a test guarantee, check it works.

### Step 7: Deploy to Vercel
```bash
npm install -g vercel
vercel
```
- Connect your GitHub repo to Vercel
- Add all environment variables in Vercel dashboard → Settings → Environment Variables
- Vercel will auto-deploy on every git push

### Step 8: Set up the daily cron job
The `vercel.json` file already configures the cron job to run daily at 9 AM.
Add this environment variable in Vercel:
```
CRON_SECRET=same-value-as-your-local-env
```

---

## How the Alert System Works
1. Every day at 9 AM, Vercel calls `/api/alerts`
2. The route checks all active guarantees
3. For any expiring in exactly 30, 15, or 7 days → sends email
4. Logs the alert in `alert_logs` table to avoid duplicates
5. WhatsApp alerts can be added later via Twilio

---

## Folder Structure
```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup + company creation
│   │   └── callback/route.ts       # Supabase auth callback
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar layout (auth-protected)
│   │   ├── page.tsx                # Main dashboard with guarantee table
│   │   ├── settings/page.tsx       # Subscription management
│   │   └── guarantees/
│   │       ├── new/page.tsx        # Add new guarantee form
│   │       └── [id]/page.tsx       # Edit/delete guarantee
│   └── api/
│       ├── onboard/route.ts        # Creates company on signup
│       ├── guarantees/
│       │   ├── route.ts            # GET all, POST new
│       │   └── [id]/route.ts       # GET one, PATCH, DELETE
│       ├── alerts/route.ts         # Daily cron — sends emails
│       ├── auth/logout/route.ts    # Sign out
│       └── razorpay/
│           ├── create-subscription/route.ts
│           └── verify/route.ts
├── lib/
│   ├── supabase-server.ts          # Server-side Supabase client
│   └── supabase-browser.ts         # Client-side Supabase client
├── types/index.ts                  # TypeScript types
└── middleware.ts                   # Auth protection for /dashboard routes
```

---

## Getting Your First Customers
1. Go to any construction company office in Guwahati
2. Show them the dashboard on your laptop/phone
3. Ask: "How do you currently track your EMD renewal dates?"
4. If they say "Excel" or "manually" — you have a customer
5. Offer 1 month free to start

## Pricing
- 14-day free trial (no card required)
- ₹2,999/month after trial
- Target: 50 customers = ₹1.5L/month

---

## Adding WhatsApp Alerts (Next Step)
1. Sign up at twilio.com
2. Enable WhatsApp sandbox or buy a number
3. In `/api/alerts/route.ts`, add after the email send:
```typescript
await twilioClient.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${company.phone}`,
  body: `BG Tracker Alert: ${g.tender_name} expires in ${daysLeft} days`
})
```
