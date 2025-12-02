# Database Connection Setup

## Quick Start

### 1. Create `.env.local` file
Create a file named `.env.local` in the project root with your Heroku database connection string:

```
DATABASE_URL=mysql://username:password@host:port/database_name
```

**To get your connection string:**
- Go to Heroku Dashboard → Your App → Settings → Config Vars
- Copy the value of `DATABASE_URL`
- Paste it into `.env.local`

### 2. Start the API Server
```bash
npm run dev
```

This starts the Next.js API server at `http://localhost:3000`

### 3. Open Your HTML Files
- Open `index.html` in your browser
- Open `customer.html` for customer portal
- Open `trainer.html` for trainer portal

The HTML files will call the API at `http://localhost:3000/api/...`

## API Endpoints Available

- `GET http://localhost:3000/api/classes` - Get all classes
- `GET http://localhost:3000/api/classes?trainerId=X` - Get classes for a trainer
- `POST http://localhost:3000/api/classes` - Create a class
- `PATCH http://localhost:3000/api/classes/[id]` - Update a class
- `GET http://localhost:3000/api/bookings` - Get bookings
- `GET http://localhost:3000/api/bookings?customerId=X` - Get bookings for a customer
- `GET http://localhost:3000/api/bookings?trainerId=X` - Get bookings for a trainer
- `POST http://localhost:3000/api/bookings` - Create a booking
- `GET http://localhost:3000/api/pets?customerId=X` - Get pets for a customer
- `POST http://localhost:3000/api/pets` - Add a pet
- `GET http://localhost:3000/api/test-db` - Test database connection

## Testing the Connection

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000/api/test-db`
3. You should see JSON with `connected: true` and table counts

## Files Updated

- `trainer.js` - Updated to call API endpoints at `http://localhost:3000/api/...`
- `lib/db.js` - Database connection (already set up)
- `app/api/` - All API routes (already set up)

## Next Steps

If you have other HTML files that need database integration, update their JavaScript to call the API endpoints similarly.

