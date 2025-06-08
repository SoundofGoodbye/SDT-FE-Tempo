export function ProtectedRoute() {}
// 'use client';
//
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useRequireAuth } from '../../hooks';
//
// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requiredRoles?: string[];
//   fallbackPath?: string;
// }
//
// export function ProtectedRoute({
//   children,
//   requiredRoles = [],
//   fallbackPath = '/login'
// }: ProtectedRouteProps) {
//   const router = useRouter();
//   const { user, isLoading } = useRequireAuth();
//
//   useEffect(() => {
//     if (!isLoading && !user) {
//       router.push(fallbackPath);
//     }
//
//     if (!isLoading && user && requiredRoles.length > 0) {
//       const hasRequiredRole = requiredRoles.some(role =>
//         user.roles?.includes(role)
//       );
//
//       if (!hasRequiredRole) {
//         router.push('/unauthorized');
//       }
//     }
//   }, [user, isLoading, requiredRoles, router, fallbackPath]);
//
//   if (isLoading) {
//     return <div>Loading...</div>;
//   }
//
//   if (!user) {
//     return null;
//   }
//
//   if (requiredRoles.length > 0) {
//     const hasRequiredRole = requiredRoles.some(role =>
//       user.roles?.includes(role)
//     );
//
//     if (!hasRequiredRole) {
//       return null;
//     }
//   }
//
//   return <>{children}</>;
// }
