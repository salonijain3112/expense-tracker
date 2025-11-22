import Image from 'next/image';
import Logo from '@/app/logo.png';
import ProfileButton from './ProfileButton';

const Header = () => {
  return (
    <header className="bg-emerald-500 text-white shadow-lg rounded-b-3xl">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="Expense Tracker logo"
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl"
            priority
          />
        </div>
        <ProfileButton />
      </div>
    </header>
  );
};

export default Header;
