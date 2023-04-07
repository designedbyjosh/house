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
      <div className="bg-stone-300 min-h-screen dark:bg-stone-900">
        <main>{children}</main>
      </div>
      <Footer />
    </>
  )
}