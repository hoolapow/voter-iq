declare module 'react-simple-maps' {
  import { ComponentType, SVGProps, MouseEvent } from 'react'

  export interface ProjectionConfig {
    scale?: number
    center?: [number, number]
    rotate?: [number, number, number]
    parallels?: [number, number]
    precision?: number
  }

  export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    projection?: string
    projectionConfig?: ProjectionConfig
    width?: number
    height?: number
  }

  export interface GeographiesProps {
    geography: string | object
    children: (props: { geographies: Geography[] }) => React.ReactNode
    parseGeographies?: (features: unknown[]) => Geography[]
  }

  export interface Geography {
    rsmKey: string
    id: string | number
    properties: Record<string, unknown>
    [key: string]: unknown
  }

  export interface GeographyProps extends Omit<SVGProps<SVGPathElement>, 'style'> {
    geography: Geography
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    onClick?: (event: MouseEvent<SVGPathElement>) => void
    onMouseMove?: (event: MouseEvent<SVGPathElement>) => void
    onMouseLeave?: (event: MouseEvent<SVGPathElement>) => void
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
  export const Marker: ComponentType<Record<string, unknown>>
  export const Line: ComponentType<Record<string, unknown>>
  export const Sphere: ComponentType<Record<string, unknown>>
  export const Graticule: ComponentType<Record<string, unknown>>
  export const ZoomableGroup: ComponentType<Record<string, unknown>>
}
