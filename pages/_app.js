import "@/styles/globals.css";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { ReactPlugin } from "@stagewise-plugins/react";

export default function App({ Component, pageProps }) {
  return (
    <>
      <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
      <Component {...pageProps} />
    </>
  );
}
