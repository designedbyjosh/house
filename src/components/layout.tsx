import { ReactNode } from 'react'
import Footer from './footer'
import Meta from './meta'
import Header from './header'
import { motion } from 'framer-motion'

type Props = {
    children: ReactNode
  }
export default function Layout({ children } : Props) {
  return (
    <>
        <motion.div layout className="min-h-screen  pb-16">
          <motion.div key="header"><Header /></motion.div>
          
          <motion.main key="main">{children}</motion.main>
        </motion.div>
      <Footer />
    </>
  )
}