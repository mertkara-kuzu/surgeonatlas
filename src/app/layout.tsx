// Root layout — the actual HTML shell lives in [locale]/layout.tsx.
// next-intl requires this thin wrapper so the middleware can inject the locale segment.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return children as any;
}
