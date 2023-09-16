import { ReactNode, useEffect } from 'react'
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
        <div className="min-h-screen  pb-16">
          <Header />
          <main>{children}</main>
        </div>
      <Footer />
    </>
  )
}