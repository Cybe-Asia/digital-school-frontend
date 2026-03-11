This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Admissions Auth Environment

Copy `.env.example` to `.env.local` and choose the admissions mode:

- `NEXT_PUBLIC_ADMISSIONS_API_MODE=mock` uses local mock repository behavior.
- `NEXT_PUBLIC_ADMISSIONS_API_MODE=real` uses fetch calls to `NEXT_PUBLIC_ADMISSIONS_API_BASE_URL`.

Routes:

- Public EOI intake: `/admissions/register`
- Admissions login: `/admissions/login`
- Request password reset: `/auth/request-reset`
- Setup OTP verification: `/auth/setup-account?token=...`
- Setup access method (post-OTP): `/auth/setup-account/method?token=...`
- Google callback placeholder: `/auth/google/callback`

Expected backend endpoints when `NEXT_PUBLIC_ADMISSIONS_API_MODE=real`:

- `POST /admissions/eoi`
- `POST /admissions/auth/login`
- `POST /admissions/auth/google/start`
- `POST /admissions/auth/request-password-reset`
- `GET /admissions/auth/setup-context?token=...`
- `POST /admissions/auth/setup/send-otp`
- `POST /admissions/auth/setup/verify-otp`
- `POST /admissions/auth/setup-account`
- `GET /admissions/eoi/leads` (prepared for future admissions admin UI)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# digital-school-portal
