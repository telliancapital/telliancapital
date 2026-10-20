import { RootShell } from "../_site/shell";

export { metadata } from "../_site/shell";

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
