import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function Container({ children, className } : {children: ReactNode, className?: string}) {
    return <div className={`${className ? className : null} container justify-center flex min-w-full`}>
        <div className="container max-w-screen-md px-5 med:px-0">{children}</div>
      </div>
  }