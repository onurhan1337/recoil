# Reminder System Setup Guide

This guide walks you through setting up the reminder and notification system for notes.

## Features

- Set reminders for any note
- Email notifications via Resend
- In-app notifications
- Automated cron job checks every 15 minutes
- Secure cron endpoint with authorization

## Prerequisites

1. Supabase project with database access
2. Resend account for email notifications
3. Vercel deployment (for cron jobs)

## Setup Instructions

### 1. Database Migration

Run the database migration to create the required tables:

```bash
supabase migration up
```

Or manually execute the SQL in `supabase/migrations/20250113000000_create_reminders_and_notifications.sql`.

This creates:
- `reminders` table for storing note reminders
- `notifications` table for in-app notifications
- Proper indexes and RLS policies

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
CRON_SECRET=your_secure_random_string_for_cron_endpoints
RESEND_API_KEY=re_your_resend_api_key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

**CRON_SECRET**: Generate a secure random string (32+ characters)
```bash
openssl rand -base64 32
```

**RESEND_API_KEY**: Get from https://resend.com/api-keys

**NEXT_PUBLIC_SITE_URL**: Your production domain (used in email links)

### 3. Install Resend Package

```bash
npm install resend
```

### 4. Configure Vercel Cron Jobs

The `vercel.json` file is already configured with a cron job that runs every 15 minutes.

When deploying to Vercel:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add all required environment variables
4. Make sure `CRON_SECRET` matches across all environments
5. Deploy your project

### 5. Configure Resend Email Domain

1. Go to https://resend.com/domains
2. Add and verify your domain
3. Update the `from` field in `lib/email.ts` if needed:
   ```typescript
   from: "Recoil <reminders@yourdomain.com>"
   ```

### 6. Test the System

#### Test Creating a Reminder

1. Open any note in the app
2. Click "Set Reminder"
3. Choose a date/time in the near future (2-3 minutes)
4. Enable email and/or in-app notifications
5. Save the reminder

#### Test Cron Endpoint Locally

```bash
curl -X GET http://localhost:3000/api/cron/check-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Test in Production

After deploying, Vercel will automatically call the cron endpoint every 15 minutes. You can also manually trigger it from the Vercel dashboard under "Cron Jobs".

## API Endpoints

### Reminders

- `GET /api/reminders` - List all user reminders
- `GET /api/reminders?note_id={id}` - List reminders for a specific note
- `POST /api/reminders` - Create a new reminder
- `PATCH /api/reminders/{id}` - Update a reminder
- `DELETE /api/reminders/{id}` - Delete a reminder

### Notifications

- `GET /api/notifications` - List all user notifications
- `GET /api/notifications?unread_only=true` - List unread notifications only
- `PATCH /api/notifications/{id}` - Mark notification as read
- `DELETE /api/notifications/{id}` - Delete notification

### Cron

- `GET /api/cron/check-reminders` - Check and process due reminders (secured with CRON_SECRET)

## Database Schema

### reminders

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| note_id | uuid | Foreign key to notes |
| user_id | uuid | Foreign key to auth.users |
| reminder_date | timestamptz | When to send reminder |
| email_enabled | boolean | Send email notification |
| in_app_enabled | boolean | Show in-app notification |
| sent | boolean | Whether reminder has been sent |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### notifications

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| reminder_id | uuid | Foreign key to reminders (nullable) |
| note_id | uuid | Foreign key to notes (nullable) |
| title | text | Notification title |
| message | text | Notification message |
| read | boolean | Whether user has read it |
| created_at | timestamptz | Creation timestamp |

## Troubleshooting

### Emails not sending

1. Check RESEND_API_KEY is correct
2. Verify domain is configured in Resend
3. Check Resend dashboard for error logs
4. Ensure "from" email matches verified domain

### Cron job not running

1. Verify CRON_SECRET environment variable is set in Vercel
2. Check Vercel dashboard > Cron Jobs for execution logs
3. Ensure vercel.json is committed to repository
4. Cron jobs only work in production, not preview deployments

### Notifications not appearing

1. Check browser console for errors
2. Verify RLS policies in Supabase
3. Test API endpoints directly with curl
4. Check React Query DevTools for cache issues

## Security Notes

- CRON_SECRET must be kept secure and never exposed publicly
- RLS policies ensure users can only access their own data
- Email service credentials should be stored as environment variables
- Cron endpoint validates authorization header before processing

## Customization

### Change Cron Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-reminders",
      "schedule": "0 * * * *"  // Every hour
    }
  ]
}
```

Common schedules:
- `*/15 * * * *` - Every 15 minutes
- `*/30 * * * *` - Every 30 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

### Customize Email Template

Edit `lib/email.ts` to modify the HTML email template.

### Change Notification Behavior

Modify `app/api/cron/check-reminders/route.ts` to customize how reminders are processed.
