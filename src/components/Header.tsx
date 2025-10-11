import CurrencySwitcher from './CurrencySwitcher';
import ProfileButton from './ProfileButton';

const Header = () => {
  return (
    <header className="bg-emerald-500 text-white shadow-lg rounded-b-3xl">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Home</h1>
          </div>
          <ProfileButton />
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-8">
          <button className="text-white font-medium pb-2 border-b-2 border-white">
            ACCOUNTS
          </button>
          <button className="text-white/70 font-medium pb-2">
            WALLET NOW
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
