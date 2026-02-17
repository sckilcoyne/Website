import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Outputs a Single-Page Application (SPA).
  basePath: '/Website',
  assetPrefix: '/Website/', // https://github.com/ethanppl/gh-pages-nextjs
  // distDir: 'dist', // Changes the build output directory to `./dist/`.  
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})
 
// Merge MDX config with Next.js config
export default withMDX(nextConfig)