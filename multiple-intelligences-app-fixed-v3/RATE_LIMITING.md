# Rate Limiting in Supabase

## What is Rate Limiting?

Supabase implements rate limiting on authentication endpoints to prevent abuse and protect your account from brute force attacks.

## Common Rate Limit Errors

- **"Too many login attempts"** - You've tried to login too many times with the same email in a short period
- **"Too many signup attempts"** - You've tried to create multiple accounts in a short period
- **"Email rate limit exceeded"** - Too many authentication requests with the same email

## Limits

- **Free Plan**: Generally allows 3-5 attempts per minute per email
- **Pro Plan**: Higher limits available

## Solutions

### If you see a rate limit error:

1. **Wait 5-10 minutes** before trying again
2. **Use a different email address** if you're testing
3. **Check your network** - make sure you're not making duplicate requests
4. **Clear browser cache** - sometimes the browser retries requests

### For Development/Testing:

1. Use test email addresses and rotate them
2. Wait between signup/login attempts
3. Use different email providers (gmail.com, test@example.com, etc.)

### For Production:

1. Implement proper error handling (which this app now has!)
2. Show users helpful messages
3. Implement progressive backoff (wait longer between retries)
4. Consider using different authentication methods

## Error Messages You'll See

The app now provides user-friendly error messages:

- **"Too many login attempts. Please wait a few minutes before trying again."**
- **"Invalid email or password."**
- **"Please confirm your email address first."**
- **"An account with this email already exists. Please login instead."**

## More Information

For more details, check Supabase documentation:
https://supabase.com/docs/guides/auth/auth-rate-limits
