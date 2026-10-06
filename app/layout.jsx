import '../tokens.css';
import './globals.css';
import Provider from './providers';
import { fontVariables } from './fonts';

export const metadata = {
  title: 'JobPilot',
  icons: { icon: '/browserIcons/browserTab.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
