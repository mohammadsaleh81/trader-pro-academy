
import * as React from "react"

// Modified to always return true since we want the mobile layout everywhere
export function useIsMobile() {
  // No need to check media queries anymore since we always want mobile mode
  const [isMobile] = React.useState(true)
  return isMobile
}
