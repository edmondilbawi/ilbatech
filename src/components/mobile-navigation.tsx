"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getContactPath, getSitePath } from "@/config/site";

export function MobileNavigation() {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    if (menuRef.current) {
      menuRef.current.open = false;
      setIsOpen(false);
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && menuRef.current?.open) {
        closeMenu();
      }
    }

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        menuRef.current?.open &&
        !menuRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  return (
    <details
      ref={menuRef}
      className="mobile-menu"
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}>
        {isOpen ? (
          <X aria-hidden="true" size={23} />
        ) : (
          <Menu aria-hidden="true" size={23} />
        )}
      </summary>
      <nav aria-label="Mobile navigation">
        <a href={getSitePath("/")} onClick={closeMenu}>
          Home
        </a>
        <a href={getSitePath("/services")} onClick={closeMenu}>
          Services
        </a>
        <a href={getSitePath("/work")} onClick={closeMenu}>
          Work
        </a>
        <a href={getSitePath("/about")} onClick={closeMenu}>
          About
        </a>
        <a href={getSitePath("/contact")} onClick={closeMenu}>
          Contact
        </a>
        <a
          className="mobile-menu-cta"
          href={getContactPath()}
          onClick={closeMenu}
        >
          Start a Conversation
        </a>
      </nav>
    </details>
  );
}
