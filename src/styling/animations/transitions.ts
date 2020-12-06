// Definitions file for different transitions to keep them consistent across the application
// @author Josh <code@josh.house>

export const fade = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
};

export const staggered =  {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

export const clickable = {
    show: {
        scale: 1
    },
    hidden: {
        scale: 1
    },
    hover: {
        scale: 1.05
    },
    tap: {
        scale: 0.99
    }
}