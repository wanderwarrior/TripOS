"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/server/actions/auth";
import type { MembershipRole } from "@prisma/client";

const ROLE_LABEL: Record<MembershipRole, string> = {
  OWNER: "Owner",
  STAFF: "Staff",
  VIEWER: "Viewer",
};

const ROLE_TONE: Record<MembershipRole, string> = {
  OWNER: "text-sand-800",
  STAFF: "text-navy",
  VIEWER: "text-muted-foreground",
};

export function UserMenu({
  name,
  email,
  agencyName,
  role,
}: {
  name: string | null;
  email: string;
  agencyName: string;
  role: MembershipRole;
}) {
  const [, startTransition] = useTransition();
  const initials = (name ?? email)
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function signOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white pl-2 pr-3 py-1.5 hover:border-sand transition-colors"
          aria-label="Account"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-ivory text-[10px] font-medium">
            {initials || <User className="h-3.5 w-3.5" />}
          </span>
          <span className="hidden sm:inline text-xs text-navy max-w-[120px] truncate">
            {agencyName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium text-navy text-sm">{name ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <div className="text-xs">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Active agency
            </p>
            <p className="mt-0.5 text-navy">{agencyName}</p>
            <p className={"mt-0.5 text-[10px] uppercase tracking-[0.18em] " + ROLE_TONE[role]}>
              <ShieldCheck className="inline h-3 w-3 mr-0.5" />
              {ROLE_LABEL[role]}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/agency" className="flex items-center gap-2">
            <Settings className="h-3.5 w-3.5" />
            Agency settings
          </Link>
        </DropdownMenuItem>
        {role === "OWNER" ? (
          <DropdownMenuItem asChild>
            <Link href="/settings/proposal" className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Proposal branding
            </Link>
          </DropdownMenuItem>
        ) : null}
        {role === "OWNER" ? (
          <DropdownMenuItem asChild>
            <Link href="/settings/team" className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Team
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          className="flex items-center gap-2 text-red-700"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
