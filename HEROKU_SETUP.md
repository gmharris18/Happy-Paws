# Heroku MySQL Database Setup Guide

## Step 1: Create Heroku Account & Install CLI

1. **Sign up** at https://www.heroku.com/ (free tier available)
2. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli
3. **Login** to Heroku:
   ```bash
   heroku login
   ```

## Step 2: Create Heroku App

```bash
cd "C:\Users\henry\OneDrive - The University of Alabama\Documents\Source\Fall2025\Happy-Paws\HappyPaws_9"
heroku create your-app-name
```

## Step 3: Add MySQL Database Add-on

Heroku offers two MySQL add-ons:

### Option A: JawsDB MySQL (Recommended)
```bash
heroku addons:create jawsdb:kitefin
```
- Free tier: 5MB storage
- Paid tiers available

### Option B: ClearDB MySQL
```bash
heroku addons:create cleardb:ignite
```
- Free tier: 5MB storage
- Paid tiers available

## Step 4: Get Your Database Connection String

After adding the add-on, Heroku automatically sets `DATABASE_URL` environment variable:

```bash
heroku config:get DATABASE_URL
```

This will show your connection string like:
```
mysql://username:password@host:port/database_name
```

## Step 5: Run Your SQL Files on Heroku Database

### Option A: Using MySQL Workbench
1. Copy the connection string from Step 4
2. Parse it to get: host, port, username, password, database
3. Connect MySQL Workbench to the Heroku database
4. Run `lib/create_database.sql` to create tables
5. Run `lib/insert_data.sql` to load data

### Option B: Using Heroku CLI + MySQL Client
```bash
# Get connection details
heroku config:get DATABASE_URL

# Connect and run SQL (if you have mysql client installed)
mysql -h [host] -u [user] -p[password] [database] < lib/create_database.sql
mysql -h [host] -u [user] -p[password] [database] < lib/insert_data.sql
```

### Option C: Using Heroku Run (if you create a script)
You can create a Node.js script to run your SQL files programmatically.

## Step 6: Set DATABASE_URL Locally (for Development)

For local development, copy the Heroku connection string to `.env.local`:

```bash
# Get the connection string
heroku config:get DATABASE_URL

# Add it to .env.local
# DATABASE_URL=mysql://username:password@host:port/database_name
```

## Step 7: Deploy Your App (Optional)

If you want to deploy the Next.js app to Heroku:

1. **Add buildpacks**:
   ```bash
   heroku buildpacks:add heroku/nodejs
   ```

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

## Important Notes:

- **Free tier limitations**: 5MB storage, connection limits
- **DATABASE_URL is automatically set** on Heroku - you don't need to set it manually
- **For local development**: Copy DATABASE_URL to `.env.local`
- **Connection pooling**: Already configured in `lib/db.js` for production use

## Testing the Connection

Once set up, test locally:
```bash
npm run dev
# Visit: http://localhost:3000/api/test-db
```

Or test on Heroku:
```bash
heroku open
# Visit: https://your-app-name.herokuapp.com/api/test-db
```

