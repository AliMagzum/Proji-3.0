import Link from 'next/link';
import { getLandingFragments } from '../src/lib/landing-html';

export default function LandingPage() {
  const { styles, body } = getLandingFragments();

  return (
    <div className="landing-root min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <noscript>
        <div className="p-8 text-center">
          <Link href="/login" className="text-blue-700 font-bold">
            Войти в Proji
          </Link>
        </div>
      </noscript>
    </div>
  );
}
