import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function NavBar() {
  const closeMenu = () => undefined;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 989) {
        closeMenu();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[1243px] bg-[#2b2b2b]/10 lg:rounded-full px-1 lg:border-l-[2px] lg:border-r-[2px] border-white backdrop-blur-sm ">
      <header className="w-full">
        <nav className="flex items-center justify-between p-2 w-full max-w-[1243px] mx-auto">
          <div className="flex justify-center items-center">
            <Link
              to="/"
              onClick={closeMenu}
              className="hover:transition hover:duration-200 hover:ease-in-out hover:scale-110 p-2"
            >
              <img src="/logo.png" alt="ApexFi" className="w-[95px] h-[24.91px] object-contain" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <WalletMultiButton className="!bg-transparent" />
          </div>
        </nav>
      </header>
    </div>
  );
}


