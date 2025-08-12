# Environment Setup Guide

## Required Environment Variables

To run this application, you need to create a `.env` file in the root directory with the following variables:

### Supabase Configuration

```
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### How to Get These Values

1. Go to [Supabase](https://supabase.com) and create a new project or use an existing one
2. Navigate to your project dashboard
3. Go to Settings > API
4. Copy the "Project URL" and paste it as `VITE_SUPABASE_URL`
5. Copy the "anon public" key and paste it as `VITE_SUPABASE_ANON_KEY`

### Example .env File

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM5NzQ5NjAwLCJleHAiOjE5NTUzMjU2MDB9.your_key_here
```

### Database Setup

After setting up the environment variables, you'll need to create the database tables. Use the SQL commands from `guide.txt` in your Supabase SQL editor.

### Storage Buckets

Create the following storage buckets in Supabase:

- `logos` - for storing company logos
- `avatars` - for storing user avatars

### Storage Policies

Apply the storage policies from `guide.md` to allow proper access control.

## Running the Application

1. Install dependencies: `npm install`
2. Create the `.env` file with your Supabase credentials
3. Run the development server: `npm run dev`
4. Build for production: `npm run build`

## Troubleshooting

- If you see "Supabase URL and Anon Key are required" error, check your `.env` file
- Make sure the `.env` file is in the root directory (same level as `package.json`)
- Restart the development server after creating the `.env` file
- Check that your Supabase project is active and the API keys are correct
