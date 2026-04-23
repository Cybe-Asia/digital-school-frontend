This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Admissions Auth Environment

Copy `.env.example` to `.env.local` and point the app at your backend gateway:

- `NEXT_PUBLIC_API_GATEWAY_URL` (browser) and `API_GATEWAY_URL` (server) are the shared gateway URL.
- `ADMISSIONS_API_BASE_URL` / `NEXT_PUBLIC_ADMISSIONS_API_BASE_URL` are kept as legacy fallbacks.
- Per-service overrides (`NEXT_PUBLIC_ADMISSION_SERVICE_URL`, `NEXT_PUBLIC_AUTH_SERVICE_URL`, etc.) work for local dev.

The mock mode has been removed — every form talks to the real backend through the gateway.

Routes:

- Public EOI intake: `/admissions/register`
- Admissions login: `/admissions/login`
- Request password reset: `/auth/request-reset`
- Setup OTP verification: `/auth/setup-account?token=...`
- Setup access method (post-OTP): `/auth/setup-account/method?token=...`
- Google callback placeholder: `/auth/google/callback`

Backend endpoints called by the app:

- `POST /api/v1/submitAdmission` (proxied through the frontend route at the same path)
- `POST {auth}/login`
- `POST {auth}/googleLogin`
- `POST {auth}/request-password-reset`
- `POST {auth}/createPassword`
- `GET {auth}/accountStatus?email=...`
- `GET {admission}/verifyEmail/{token}`
- `GET {admission}/isVerify?lead_id=...`
- `POST {admission}/students`
- `POST {otp}/sendOTP`, `POST {otp}/verifyOTP`

## Quality Gate

Before merging, the repository standard is:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

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
