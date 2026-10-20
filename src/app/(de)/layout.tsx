import { RootShell } from "../_site/shell";

export { metadata } from "../_site/shell";

export default function GermanRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="de">{children}</RootShell>;
}
