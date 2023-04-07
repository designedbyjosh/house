import { ReactNode } from 'react'
import Footer from './footer'
import Meta from './meta'

type Props = {
    children: ReactNode
  }

export default function Layout({ children } : Props) {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        <main>{children}</main>
      </div>
      <Footer />
    </>
  )
}