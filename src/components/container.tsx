import { ReactNode } from "react";

export default function Container({ children, className } : {children: ReactNode, className?: string}) {
    return <div className={`${className ? className : null} container justify-center flex min-w-full`}>
        <div className="container max-w-screen-xl px-5 med:px-0">{children}</div>
      </div>
  }