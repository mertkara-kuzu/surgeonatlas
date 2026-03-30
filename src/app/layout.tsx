import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// Root layout — the actual HTML shell lives in [locale]/layout.tsx.
// next-intl requires this thin wrapper so the middleware can inject the locale segment.
export default function RootLayout({ children }: Props) {
  return children as JSX.Element;
}
