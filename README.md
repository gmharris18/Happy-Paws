# Happy-Paws
MIS 330

# Happy Paws Training - Frontend

A modern Next.js frontend for Happy Paws Training, a pet class scheduling and booking system.

## Features

- **Customer Portal**: Register pets, browse classes, book/cancel appointments
- **Trainer Portal**: Create classes, manage schedules, view rosters, analytics dashboard
- **Responsive UI**: Clean, modern design with Tailwind CSS
- **External API Integration**: All data operations call an external REST API

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API endpoint:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```
   
   Or modify `lib/api.js` to set your API base URL directly.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## API Endpoints Expected

The frontend expects the following REST API endpoints:

- `GET /api/classes` - List all classes (optional: `?trainerId=X`)
- `POST /api/classes` - Create new class
- `PATCH /api/classes/[id]` - Update class
- `GET /api/bookings` - List bookings (optional: `?customerId=X`, `?trainerId=X`, `?classId=X`)
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings` - Cancel booking
- `GET /api/pets` - List pets (required: `?customerId=X`)
- `POST /api/pets` - Add pet
- `GET /api/analytics` - Get analytics (optional: `?trainerId=X`)
- `POST /api/auth/login` - Login (customer or trainer)
- `POST /api/auth/signup` - Sign up (customer)

## Project Structure

```
app/
  ├── page.js              # Home page
  ├── login/               # Login page
  ├── signup/              # Signup page
  ├── classes/             # Browse classes page
  └── dashboard/
      ├── customer/        # Customer dashboard
      └── trainer/         # Trainer dashboard
lib/
  └── api.js              # API helper functions
```

## Notes

- All database operations are handled by your external backend API
- Authentication uses localStorage for demo purposes (use proper auth in production)
- The frontend is fully functional and ready to connect to your backend API
