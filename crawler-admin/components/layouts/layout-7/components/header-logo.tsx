import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';

const HeaderLogo = () => {
  return (
    <div className="flex items-stretch gap-1.5 lg:gap-10 grow">
      <div className="flex items-center gap-2.5">
        <Link href="/crawler">
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-circle-primary.svg')}
            className="dark:hidden min-h-[34px]"
            alt="logo"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-circle-primary-dark.svg')}
            className="hidden dark:inline-block min-h-[34px]"
            alt="logo"
          />
        </Link>

        <h3 className="text-mono text-lg font-medium hidden lg:block">
          crawler-admin
        </h3>
      </div>
    </div>
  );
};

export { HeaderLogo };
