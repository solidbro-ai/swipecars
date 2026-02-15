# 🚗 SwipeCars

A modern, Tinder-style car marketplace where you can swipe right on your dream car. Built with Next.js 14, featuring end-to-end encrypted messaging, beautiful animations, and a premium user experience.

![SwipeCars](https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=600&fit=crop)

## ✨ Features

### 🎯 Core Features

- **Tinder-Style Swiping** - Discover cars with smooth, satisfying swipe gestures
- **Advanced Filters** - Filter by make, model, year, price, mileage, condition, and features
- **Save Filter Presets** - Save your favorite search configurations
- **Like & Save** - Keep track of cars you're interested in
- **Car Listings** - Create beautiful listings with multiple photos

### 💬 Secure Messaging

- **End-to-End Encryption** - Messages encrypted using TweetNaCl (libsodium)
- **Real-Time Updates** - Instant message delivery with polling
- **Thread-Based Conversations** - Messages organized by car listing
- **Unread Indicators** - Never miss a message

### 👤 User Experience

- **Authentication** - Email/password and Google OAuth
- **User Profiles** - Customizable profiles with contact preferences
- **Dark Mode** - Beautiful dark theme support
- **Responsive Design** - Mobile-first, works great on all devices
- **Smooth Animations** - Powered by Framer Motion

### 📦 Extra Features

- **Image Compression** - Auto-compress uploads for fast loading
- **Share Listings** - Native share API integration
- **Report Listings** - Keep the marketplace safe
- **Price Drop Notifications** - Get notified when liked cars drop in price
- **Recently Viewed** - Quick access to cars you've browsed
- **SEO Optimized** - Full metadata for social sharing

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **Encryption:** TweetNaCl
- **Image Processing:** Sharp
- **Deployment:** Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/swipecars.git
   cd swipecars
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/swipecars?schema=public"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-secure-secret-here"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed demo data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Account

After seeding, you can log in with:
- **Email:** demo@swipecars.com
- **Password:** Demo123!

## 📁 Project Structure

```
swipecars/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Demo data seeder
├── public/
│   └── uploads/         # User-uploaded images
├── src/
│   ├── app/
│   │   ├── (auth)/      # Auth pages (login, register)
│   │   ├── api/         # API routes
│   │   ├── browse/      # Swipe interface
│   │   ├── cars/        # Car listings & details
│   │   ├── messages/    # Messaging system
│   │   └── profile/     # User profile
│   ├── components/
│   │   ├── cars/        # Car-related components
│   │   ├── layout/      # Layout components
│   │   ├── messages/    # Messaging components
│   │   └── ui/          # Base UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities & config
│   └── types/           # TypeScript types
├── .env.example         # Environment template
├── package.json
└── README.md
```

## 🔐 Security

### End-to-End Encryption

All messages are encrypted client-side using TweetNaCl's `box` construction:
- Each user gets a keypair on registration
- Messages encrypted with sender's secret + receiver's public key
- Server only stores encrypted data
- Only participants can decrypt messages

### Authentication

- Passwords hashed with bcrypt (12 rounds)
- JWT-based sessions with NextAuth.js
- CSRF protection built-in
- Secure cookie handling

## 🎨 Design System

SwipeCars uses a custom design system built on shadcn/ui:

- **Colors:** Professional blues with purple accents
- **Typography:** Inter font family
- **Spacing:** Consistent 4px grid
- **Animations:** Smooth, purposeful transitions
- **Dark Mode:** Full dark theme support

## 📱 Responsive Design

- **Mobile-first approach**
- **Breakpoints:**
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Docker

```dockerfile
# Dockerfile provided for containerized deployment
docker build -t swipecars .
docker run -p 3000:3000 swipecars
```

### Environment Variables for Production

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Your app's URL |
| `NEXTAUTH_SECRET` | Random 32+ character secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `NEXT_PUBLIC_APP_URL` | Public app URL for metadata |

## 📊 Database Schema

Key models:
- **User** - User accounts with encryption keys
- **Car** - Car listings with images and features
- **Like** - User likes on cars
- **MessageThread** - Conversation containers
- **Message** - Encrypted messages
- **FilterPreset** - Saved filter configurations

See `prisma/schema.prisma` for complete schema.

## 🧪 Development

```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) - Smooth animations
- [TweetNaCl](https://tweetnacl.js.org/) - Cryptographic library
- [Unsplash](https://unsplash.com/) - Demo images

---

Built with ❤️ by the SwipeCars team
