import Link from 'next/link';
import type { LoginLinkProps } from '../types';

export function LoginLink({ className = '' }: LoginLinkProps) {
  return (
    <div className={`text-center text-sm ${className}`}>
      <span className="text-gray-600">Don&apos;t have an account? </span>
      <Link
        href="/register"
        className="text-gray-800 hover:text-gray-900 font-semibold focus:outline-none focus:underline"
      >
        Sign up
      </Link>
    </div>
  );
}
