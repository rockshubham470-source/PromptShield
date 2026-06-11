# Supabase Setup for PromptShield

This directory contains the SQL schema and setup instructions for deploying PromptShield with Supabase.

## Setup Instructions

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project
- Note down your project URL and anon/public key

### 2. Execute Schema
- In your Supabase dashboard, go to SQL Editor
- Copy and paste the contents of `schema.sql`
- Run the SQL to create all tables and enable Row Level Security (RLS)

### 3. Enable Email Authentication
- In Supabase Dashboard → Authentication → Settings
- Enable Email sign-ups
- Configure email redirect URLs (for production)

### 4. Environment Variables
Create a `.env` file in your project root with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Generated API Endpoints
Supabase provides auto-generated RESTful endpoints:
- `/rest/v1/users`
- `/rest/v1/api_keys`
- `/rest/v1/detection_rules`
- `/rest/v1/detections`
- `/rest/v1/notifications`
- `/rest/v1/usage_metrics`

However, for security and business logic, we recommend creating custom Edge Functions or using a separate backend.

## Table Descriptions

### users
Stores user profile information linked to Supabase auth.users
- `id`: UUID, foreign key to auth.users
- `email`: User's email address
- `name`: User's full name
- `tier`: Subscription tier (free, professional, business, enterprise)
- `created_at`, `updated_at`: Timestamps

### api_keys
Stores API keys for programmatic access
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `name`: Friendly name for the key
- `key_hash`: Hashed version of the actual API key (for security)
- `prefix`: First few characters of the key (for display)
- `last_used_at`: When the key was last used
- `expires_at`: Expiration date (optional)
- `is_active`: Whether the key is active

### detection_rules
Stores user-defined detection rules
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `name`: Rule name
- `pattern`: The regex or pattern to detect
- `description`: Rule description
- `is_active`: Whether the rule is active
- `risk_level`: Risk level (low, medium, high, critical)
- `created_at`, `updated_at`: Timestamps

### detections
Stores detection events
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `rule_id`: Foreign key to detection_rules (nullable)
- `content`: The content that was analyzed
- `risk_level`: Assessed risk level
- `confidence`: Confidence score (0-1)
- `detected_at`: When detection occurred
- `metadata`: Additional JSON data

### notifications
Stores user notifications
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `title`: Notification title
- `message`: Notification message
- `category`: Notification type (security, billing, system)
- `is_read`: Whether notification has been read
- `created_at`: When notification was created

### usage_metrics
Tracks usage metrics for billing/analytics
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `metric_type`: Type of metric (api_calls, detections, etc.)
- `metric_value`: Numeric value
- `recorded_at`: When metric was recorded

## Security Note
All tables have Row Level Security (RLS) enabled with policies that restrict access to:
- Users can only access their own data
- Service roles (if needed) can bypass RLS for administrative tasks

For production, consider using Supabase Service Role keys in your backend for administrative operations.