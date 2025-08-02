# Meo Stationery 📝

A modern e-commerce platform for stationery products built with Next.js, Prisma, and PostgreSQL.

## Features

- 🛍️ Product catalog with categories
- 🛒 Shopping cart functionality
- 📦 Order management
- 👤 User management
- 💳 Payment integration with VNPay
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern UI with Radix UI components

## Quick Setup

Run the automated setup script:

```bash
./setup.sh
```

Or follow the manual setup steps below.

## Manual Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/meo_stationery?schema=public"
VNP_TMN_CODE=your_vnpay_tmn_code
VNP_HASH_SECRET=your_vnpay_hash_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

3. Set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Create/update database schema
npx prisma db push

# Seed with sample data (optional)
npx tsx prisma/seed.ts
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Setup

This project uses PostgreSQL with Prisma ORM. Make sure you have:

1. PostgreSQL installed and running
2. A database created for the project
3. Updated the `DATABASE_URL` in your `.env.local` file

### Database Schema

The project includes these main models:
- `User` - Customer information
- `Product` - Stationery products
- `Order` - Customer orders
- `OrderItem` - Items within orders
- `Payment` - Payment records
- `Address` - Customer addresses

## Development

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
