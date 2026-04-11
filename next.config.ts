import { readFileSync } from 'fs'
import type { NextConfig } from 'next'

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'))

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/gcode-tpgen',
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
}

export default nextConfig
