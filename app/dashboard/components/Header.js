import React from "react";
import ButtonAccount from "@/components/ButtonAccount";
function Header() {
  return (
    <header className="w-full">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold text-indigo-600">Track Money</h1>
        <nav className="space-x-4">
          {/* <a href="#" className="text-gray-600 hover:text-indigo-600">
          Home
        </a>
        <a href="#" className="text-gray-600 hover:text-indigo-600">
          Transactions
        </a>
        <a href="#" className="text-gray-600 hover:text-indigo-600">
          Settings
        </a> */}
          <ButtonAccount />
        </nav>
      </div>
    </header>
  );
}

export default Header;
