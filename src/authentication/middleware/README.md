# Session Middleware

This middleware provides session validation functionality for protected routes in the application.

## Usage

### Basic Session Validation

```typescript
import { validateSession } from '@/authentication/middleware/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Validate the session
  const session = await validateSession(request);

  if (!session.isValid) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Access user information
  const { playerId, email, type } = session;

  // Your protected route logic here
  return NextResponse.json({
    message: 'Protected data',
    user: { playerId, email, type }
  });
}
```

### Extracting Token Only

```typescript
import { getTokenFromCookie } from '@/authentication/middleware/session';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = getTokenFromCookie(request);

  if (!token) {
    // Handle missing token
  }

  // Use token for custom validation
}
```

### Protected Page Component

```typescript
import { validateSession } from '@/authentication/middleware/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function ProtectedPage() {
  // Create a mock request with cookies
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    redirect('/login');
  }

  // Validate session in server component
  // Note: You'll need to adapt this for server components
  // or use middleware at the route level

  return (
    <div>
      <h1>Protected Content</h1>
    </div>
  );
}
```

## API Reference

### `validateSession(request: NextRequest): Promise<SessionValidationResult>`

Validates the session token from the request cookies.

**Parameters:**
- `request`: Next.js request object

**Returns:**
```typescript
{
  isValid: boolean;
  playerId?: string;
  email?: string;
  type?: 'player' | 'coach';
  error?: string;
}
```

**Example:**
```typescript
const session = await validateSession(request);

if (session.isValid) {
  console.log(`User ${session.email} is authenticated`);
} else {
  console.log(`Authentication failed: ${session.error}`);
}
```

### `getTokenFromCookie(request: NextRequest): string | null`

Extracts the JWT token from the session cookie.

**Parameters:**
- `request`: Next.js request object

**Returns:**
- JWT token string if found
- `null` if not found or invalid

**Example:**
```typescript
const token = getTokenFromCookie(request);

if (token) {
  // Token exists, can be used for custom validation
} else {
  // No token found
}
```

## Error Handling

The middleware handles errors gracefully:

- **No token**: Returns `{ isValid: false, error: 'No session token found' }`
- **Invalid token**: Returns `{ isValid: false, error: 'Invalid or expired token' }`
- **Expired token**: Returns `{ isValid: false, error: 'Invalid or expired token' }`
- **Verification error**: Returns `{ isValid: false, error: 'Session validation failed' }`

All errors are logged server-side but generic messages are returned to prevent information leakage.

## Security Considerations

1. **HTTP-only cookies**: Session tokens are stored in HTTP-only cookies to prevent XSS attacks
2. **Token verification**: All tokens are verified using JWT signature validation
3. **Error messages**: Generic error messages prevent information disclosure
4. **Logging**: All validation failures are logged for security monitoring
5. **No sensitive data exposure**: Error details are logged but not returned to clients

## Testing

Comprehensive unit tests are available in `src/__tests__/authentication/middleware/session.test.ts`.

Run tests:
```bash
npm test -- src/__tests__/authentication/middleware/session.test.ts
```
