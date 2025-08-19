export const metadata = {
  title: 'BCU Labs',
  description: 'Using data to better understand and advocate for biking in Boston.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}