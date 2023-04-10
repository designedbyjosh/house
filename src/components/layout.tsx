import { ReactNode } from 'react'
import Footer from './footer'
import Meta from './meta'
import Header from './header'

type Props = {
    children: ReactNode
  }

export default function Layout({ children } : Props) {
  return (
    <>
      <Meta />
        <div className="bg-stone-200 min-h-screen dark:bg-stone-900  pb-16">
          <Header />
          <main>{children}</main>
        </div>
      <Footer />
    </>
  )
}