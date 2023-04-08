import { ReactNode } from "react";

export default function Container({ children } : {children: ReactNode}) {
    return <div className="container justify-center flex min-w-full">
        <div className="container max-w-screen-xl px-10 med:px-0">{children}</div>
      </div>
  }