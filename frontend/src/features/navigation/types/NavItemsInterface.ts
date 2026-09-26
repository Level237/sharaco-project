export interface NavItemInterface {
  title: string
  icon: React.ReactNode
  href?: any
  submenu?: NavItemInterface[]
  isHeader?: boolean
}