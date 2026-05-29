export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    // Skip Next internals, favicon, the /assets public folder, and any
    // request whose path ends in a common static-image extension.
    // The image optimizer re-fetches assets via this same handler — if
    // the proxy redirected those internal requests, the optimizer would
    // receive an empty redirect body and fail content-type detection.
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
