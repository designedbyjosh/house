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
        <div className="min-h-screen  pb-16">
          <Header />
          <main key="main">{children}</main>
        </div>
      <Footer />
    </>
  )
}