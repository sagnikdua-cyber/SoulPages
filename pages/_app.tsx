import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter, Great_Vibes } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const greatVibes = Great_Vibes({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.className} ${greatVibes.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
