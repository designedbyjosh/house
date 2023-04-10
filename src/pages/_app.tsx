import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout'
config.autoAddCss = false

export default function App({ Component, pageProps, router }: AppProps) {
  return <Layout>
      <AnimatePresence initial={false} mode="wait">
        <Component {...pageProps} key={router.pathname}/>
      </AnimatePresence>
  </Layout>
}
