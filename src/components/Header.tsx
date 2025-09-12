import CurrencySwitcher from './CurrencySwitcher';

const Header = () => {
  return (
    <header className="bg-brand-primary text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
        <CurrencySwitcher />
      </div>
    </header>
  );
};

export default Header;
