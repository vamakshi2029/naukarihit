import './globals.css';
import AuthProvider from '@/components/AuthProvider';

export const metadata = {
  title: 'NaukariHit | College Placement Portal',
  description: 'Drives, applications and placement tracking for students and the placement cell.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
