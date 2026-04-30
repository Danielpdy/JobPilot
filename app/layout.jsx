import './globals.css';
import Provider from './providers';

export const metadata = {
  title: 'JobPilot',
  icons: { icon: '/browserIcons/browserTab.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
