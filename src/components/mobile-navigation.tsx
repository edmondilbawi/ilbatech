"use client";

import { Menu } from "lucide-react";
import { useRef } from "react";
import { getContactPath, getSitePath } from "@/config/site";

export function MobileNavigation() {
  const menuRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  return (
    <details ref={menuRef} className="mobile-menu">
      <summary aria-label="Toggle navigation menu">
        <Menu aria-hidden="true" size={23} />
      </summary>
      <nav aria-label="Mobile navigation">
        <a href={getSitePath("/")} onClick={closeMenu}>Home</a>
        <a href={getSitePath("/services")} onClick={closeMenu}>Services</a>
        <a href={getSitePath("/solutions")} onClick={closeMenu}>Solutions</a>
        <a href={getSitePath("/about")} onClick={closeMenu}>About</a>
        <a href={getSitePath("/contact")} onClick={closeMenu}>Contact</a>
        <a className="mobile-menu-cta" href={getContactPath()} onClick={closeMenu}>Start a Conversation</a>
      </nav>
    </details>
  );
}
