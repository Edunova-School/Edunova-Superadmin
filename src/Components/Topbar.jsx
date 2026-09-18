import React from "react";
import { Menu, Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { notificationsList } from "../data/mockData.js";

export default function Topbar({ onMenuClick }) {
  const unread = notificationsList.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur border-b border-black/[0.06]">
      <div className="flex items-center gap-4 px-5 md:px-8 h-16">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-black/50 hover:bg-black/5"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex-1 max-w-sm relative hidden sm:block">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
          <input
            type="text"
            placeholder="Search applicants, applications, admins…"
            className="w-full bg-black/[0.03] border border-transparent focus:border-black/10 focus:bg-white rounded-full pl-9 pr-4 py-2 text-sm placeholder:text-black/30 transition-colors"
          />
        </div>

        <div className="flex-1 sm:hidden" />

        <div className="flex items-center gap-2 ml-auto">
          <Link
            to="/notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-black/50 hover:bg-black/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={1.6} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold ring-2 ring-canvas" />
            )}
          </Link>

          <div className="w-px h-6 bg-black/10 mx-1" />

          <Link to="/settings" className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-black/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center">
              <span className="font-serif font-semibold text-white text-xs">SA</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-black leading-none">Superadmin</p>
              <p className="text-[11px] text-black/35 mt-0.5">superadmin@edunova.edu.ng</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
