"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { 
  Bars3Icon, 
  BugAntIcon, 
  HomeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  ScaleIcon
} from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useAuth } from "~~/hooks/useAuth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Marketplace",
    href: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    label: "My Portfolio",
    href: "/portfolio",
    icon: <BriefcaseIcon className="h-4 w-4" />,
  },
  {
    label: "Governance",
    href: "/governance",
    icon: <ScaleIcon className="h-4 w-4" />,
  },
  {
    label: "Admin Panel",
    href: "/admin",
    icon: <Cog6ToothIcon className="h-4 w-4" />,
    adminOnly: true,
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  return (
    <>
      {menuLinks.map(({ label, href, icon, adminOnly }) => {
        // Hide admin-only links for non-admins
        if (adminOnly && !isAdmin) return null;
        
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
              {adminOnly && <span className="badge badge-primary badge-xs">Admin</span>}
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <BuildingOfficeIcon className="h-10 w-10 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">PropShare</span>
            <span className="text-xs">Real Estate Investment Platform</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
