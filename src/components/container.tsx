import { ReactNode } from "react";

export default function Container({ children } : {children: ReactNode}) {
    return <div className="container justify-center flex min-w-full">
        <div className="container max-w-screen-xl">{children}</div>
      </div>
  }