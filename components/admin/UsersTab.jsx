"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Filter,
  X,
  ChevronDown,
  Loader2,
  Users,
  IdCard,
  Activity,
  UserPlus
} from "lucide-react";
import Skeleton from "../Skeleton";


export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const [filters, setFilters] = useState({
    userType: "",
    from: "",
    to: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    "1d": { newUsers: 0, activeUsers: 0 },
    "7d": { newUsers: 0, activeUsers: 0 },
    "30d": { newUsers: 0, activeUsers: 0 },
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, limit, search, filters]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Fetch stats failed", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page,
        limit,
        search,
        ...(filters.userType && { userType: filters.userType }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsers(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch users failed", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (userId, newUserType) => {
    try {
      setUpdatingUserId(userId);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/users/change-role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newUserType }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update role");
        return;
      }

      fetchUsers();
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner": return <ShieldAlert size={14} className="text-rose-500" />;
      case "admin": return <ShieldCheck size={14} className="text-[var(--accent)]" />;
      default: return <User size={14} className="text-[var(--muted)]/60" />;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "owner": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "admin": return "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20";
      default: return "bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]";
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">Users</h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
            <Users size={13} className="text-[var(--accent)]" />
            <span>{pagination.total} Users</span>
          </div>
          <button
            onClick={fetchUsers}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none"
            title="Refresh"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      {/* ================= COMPACT STATS OVERVIEW ================= */}
      <StatsOverview stats={stats} loading={statsLoading} />

      {/* ================= COMBINED SEARCH & FILTERS CAPSULE ================= */}
      <div className="relative flex items-center w-full rounded-2xl sm:rounded-full border border-[var(--border)] bg-[var(--card)]/80 focus-within:border-[var(--accent)]/50 focus-within:ring-2 focus-within:ring-[var(--accent)]/15 transition-all shadow-xs h-9 sm:h-9.5 px-3">
        <Search className="text-[var(--muted)]/50 shrink-0 mr-2" size={14} />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email, or user ID..."
          className="w-full bg-transparent text-[var(--foreground)] text-xs sm:text-sm placeholder:text-[var(--muted)]/40 outline-none"
        />

        {/* Clear 'X' button */}
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
            className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer shrink-0 mr-1"
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}

        <div className="h-4 w-[1px] bg-[var(--border)]/70 mx-1 shrink-0" />

        {/* Combined Filter Button */}
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className={`relative p-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 ${
            Object.values(filters).some(Boolean)
              ? "bg-[var(--accent)] text-black font-extrabold shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06]"
          }`}
          title="Filter Users"
        >
          <Filter size={14} className={Object.values(filters).some(Boolean) ? "text-black" : "text-[var(--accent)]"} />
          {Object.values(filters).some(Boolean) && (
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
          )}
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
            <p className="text-sm text-[var(--muted)] font-medium">Fetching users...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-[2rem] overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)] text-[var(--muted)]">
                  <tr className="text-[9px] font-black uppercase tracking-[0.1em]">
                    <th className="pl-6 pr-4 py-3">User Profile</th>
                    <th className="px-4 py-3">Contact Details</th>
                    <th className="px-4 py-3">Activity Info</th>
                    <th className="pl-4 pr-6 py-3 text-right">Role Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/50">
                  {users.map((u, idx) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setSelectedUser(u)}
                      className="group hover:bg-[var(--foreground)]/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="pl-6 pr-4 py-2.5 sm:py-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={u} />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[var(--foreground)] font-bold text-sm leading-none group-hover:text-[var(--accent)] transition-colors">{u.name}</span>
                            <span className="text-[10px] text-[var(--muted)] font-mono opacity-50">{u.userId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 sm:py-3">
                        <div className="flex flex-col gap-1 text-[var(--muted)]">
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="opacity-40" />
                            <span className="text-[var(--foreground)] font-semibold text-xs tracking-tight">{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={10} className="opacity-40" />
                              <span className="text-[10px] font-medium opacity-60">{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 sm:py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[var(--muted)]">
                            <Calendar size={12} className="opacity-40" />
                            <span className="text-[11px] font-bold">
                              {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[var(--muted)] opacity-60">
                            <Activity size={10} />
                            <span className="text-[9px] font-black uppercase tracking-wider">
                              {u.lastLogin ? "Active Recently" : "Never Logged In"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="pl-4 pr-6 py-2.5 sm:py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-block">
                          <RoleDropdown
                            value={u.userType}
                            disabled={updatingUserId === u.userId || u.userType === "owner"}
                            onChange={(v) => changeUserRole(u.userId, v)}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-2">
              {users.map((u, idx) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => setSelectedUser(u)}
                  className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)] active:scale-[0.99] transition-all cursor-pointer shadow-xs space-y-2"
                >
                  {/* Top Row: User Avatar, Name, User ID & Role */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar user={u} size="sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--foreground)] text-xs truncate leading-tight">{u.name}</p>
                        <span className="text-[9.5px] text-[var(--muted)] font-mono opacity-60 block leading-tight mt-0.5 truncate">
                          #{u.userId}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <RoleDropdown
                        value={u.userType}
                        compact
                        disabled={updatingUserId === u.userId || u.userType === "owner"}
                        onChange={(v) => changeUserRole(u.userId, v)}
                      />
                    </div>
                  </div>

                  {/* Middle Row: Contact Info (Email & Prominent Full Phone Number) */}
                  <div className="pt-0.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                    {/* Email */}
                    <div className="flex items-center gap-1.5 text-[var(--muted)] min-w-0 flex-1">
                      <Mail size={12} className="opacity-50 shrink-0" />
                      <span className="truncate text-[11px]">{u.email}</span>
                    </div>

                    {/* Prominent Phone Number (ALWAYS FULLY VISIBLE) */}
                    {u.phone ? (
                      <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[var(--foreground)] bg-[var(--foreground)]/[0.04] px-2 py-0.5 rounded-md border border-[var(--border)]/60 shrink-0 ml-auto">
                        <Phone size={10.5} className="text-[var(--accent)] shrink-0" />
                        <span>{u.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[var(--muted)]/40 italic ml-auto">No phone</span>
                    )}
                  </div>

                  {/* Bottom Row: Metadata & Details link */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border)]/40 text-[10px] text-[var(--muted)]">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} className="opacity-50 shrink-0" />
                      <span>Joined {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <span className="text-[var(--accent)] font-bold flex items-center gap-1 hover:underline text-[10.5px]">
                      Details →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {!users.length && (
              <div className="py-24 text-center border border-dashed border-[var(--border)] rounded-[2rem]">
                <Users className="mx-auto text-[var(--muted)]/20 mb-4" size={48} />
                <p className="text-sm font-medium text-[var(--muted)]">No users found matching your search.</p>
              </div>
            )}

            {/* ================= PAGINATION ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-20 transition-all outline-none"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-20 transition-all outline-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DRAWER (User Info) ================= */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] shadow-2xl z-[1110] flex flex-col"
            >
              {/* Header */}
              <div className="p-3.5 sm:p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar user={selectedUser} size="md" />
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-extrabold text-[var(--foreground)] truncate leading-tight">
                      {selectedUser.name}
                    </h4>
                    <span className="text-[10px] text-[var(--muted)] font-mono block mt-0.5">
                      #{selectedUser.userId}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.05] hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-[var(--muted)] transition-all cursor-pointer shrink-0 ml-2"
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
                {/* Account Role Setting */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9.5px] font-extrabold text-[var(--muted)] uppercase tracking-wider block">Account Role</span>
                    <span className="text-xs font-bold capitalize text-[var(--foreground)] mt-0.5 block">{selectedUser.userType}</span>
                  </div>
                  <RoleDropdown
                    value={selectedUser.userType}
                    compact
                    disabled={updatingUserId === selectedUser.userId || selectedUser.userType === "owner"}
                    onChange={(v) => {
                      changeUserRole(selectedUser.userId, v);
                      setSelectedUser(null);
                    }}
                  />
                </div>
                {selectedUser.userType === "owner" && (
                  <p className="text-[10px] text-rose-500 font-medium px-1 italic -mt-2">Owner role is protected and cannot be modified.</p>
                )}

                {/* Profile & Contact Grid (Compact Cards) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[var(--muted)] uppercase tracking-wider px-0.5">
                    User Information
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {/* User ID */}
                    <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block">User ID</span>
                      <span className="text-xs font-mono font-bold text-[var(--foreground)] mt-0.5 block truncate">
                        {selectedUser.userId}
                      </span>
                    </div>

                    {/* Phone Number - PROMINENT & NEVER CUT OFF */}
                    <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block">Phone Number</span>
                      <span className="text-xs font-mono font-bold text-[var(--accent)] mt-0.5 block truncate">
                        {selectedUser.phone || "Not provided"}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="col-span-2 p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block">Email Address</span>
                      <span className="text-xs font-semibold text-[var(--foreground)] mt-0.5 block truncate" title={selectedUser.email}>
                        {selectedUser.email}
                      </span>
                    </div>

                    {/* Joined Date */}
                    <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block">Joined Date</span>
                      <span className="text-xs font-bold text-[var(--foreground)] mt-0.5 block truncate">
                        {new Date(selectedUser.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Last Login */}
                    <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block">Last Login</span>
                      <span className="text-xs font-bold text-[var(--foreground)] mt-0.5 block truncate">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Never"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Security / IP Metadata */}
                <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Last IP Address</span>
                  <span className="font-mono text-xs font-semibold text-[var(--foreground)]">
                    {selectedUser.lastIp || "Unknown"}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= FILTER BOTTOMSHEET ================= */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Bottomsheet Drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-[var(--card)] rounded-t-3xl sm:rounded-2xl border border-[var(--border)] p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col z-10 pb-6 sm:pb-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Indicator Handle */}
              <div className="w-10 h-1 rounded-full bg-[var(--foreground)]/20 mx-auto mb-3 sm:hidden" />

              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--foreground)]">Filters</h3>
                  <p className="text-[11px] text-[var(--muted)]">Filter users by role type and registration dates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 rounded-xl bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all outline-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body (Scrollable) */}
              <div className="py-4 space-y-4 overflow-y-auto">
                {/* Role Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Role Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["user", "admin", "owner"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFilters({ ...filters, userType: filters.userType === type ? "" : type })}
                        className={`
                          py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all outline-none cursor-pointer text-center
                          ${filters.userType === type
                            ? "bg-[var(--accent)] border-[var(--accent)] text-black shadow-md font-extrabold"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/40"}
                        `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Inputs in responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Joined From</label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs font-semibold focus:border-[var(--accent)] outline-none transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Joined To</label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs font-semibold focus:border-[var(--accent)] outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ userType: "", from: "", to: "" });
                    setPage(1);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)] transition-all cursor-pointer"
                >
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-black text-xs font-extrabold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= CUSTOM DROPDOWN ================= */
function RoleDropdown({ value, onChange, disabled, compact }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const roles = [
    { value: "user", label: "User", icon: <User size={12} /> },
    { value: "admin", label: "Admin", icon: <ShieldCheck size={12} /> },
  ];

  if (value === "owner") {
    roles.push({ value: "owner", label: "Owner", icon: <ShieldAlert size={12} /> });
  }

  const selectedRole = roles.find((r) => r.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between
          ${compact ? "h-8 min-w-[85px] sm:min-w-[95px] px-2.5 sm:px-3 text-[11px] gap-1.5" : "h-10 min-w-[125px] w-full px-4 text-xs gap-3"}
          rounded-full border border-[var(--border)] bg-[var(--foreground)]/[0.03]
          font-semibold transition-all outline-none cursor-pointer
          ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-[var(--foreground)]/[0.06]"}
          ${isOpen ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30" : "text-[var(--foreground)]"}
        `}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--accent)]">{selectedRole?.icon}</span>
          <span className="capitalize">{selectedRole?.label}</span>
        </div>
        <ChevronDown size={compact ? 12 : 14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 5 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute z-[1200] right-0 mt-1 w-full min-w-[150px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1.5 overflow-hidden backdrop-blur-xl"
          >
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => {
                  onChange(role.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold rounded-lg transition-all outline-none
                  ${role.value === value
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)]"}
                `}
              >
                <span className={role.value === value ? "text-white" : "text-[var(--accent)]"}>{role.icon}</span>
                <span className="capitalize">{role.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= AVATAR ================= */
function Avatar({ user, size = "md" }) {
  const [error, setError] = useState(false);
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20",
  };

  const initials = user.userId
    ?.replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase() || "U";

  if (user.avatar && !error) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        onError={() => setError(true)}
        className={`${sizeClasses[size]} rounded-2xl object-cover border-2 border-[var(--border)] shadow-inner`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-[var(--accent)] via-indigo-500 to-purple-600 shadow-lg shadow-[var(--accent)]/10`}>
      {size === 'lg' ? <User size={32} /> : initials}
    </div>
  );
}

/* ================= HELPERS ================= */
function DrawerSection({ icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[var(--muted)]/40">
        <div className="text-[var(--accent)]">{icon}</div>
        <h4 className="text-xs font-bold uppercase tracking-widest">{title}</h4>
      </div>
      <div className="grid grid-cols-1 gap-4 px-1">{children}</div>
    </div>
  );
}

function DrawerDetail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--border)] pb-3">
      <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-[var(--foreground)]">
        {value || "Not available"}
      </span>
    </div>
  );
}

function StatsOverview({ stats, loading }) {
  const periods = [
    { key: "1d", label: "24H" },
    { key: "7d", label: "7D" },
    { key: "30d", label: "30D" },
  ];

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Skeleton height={42} className="rounded-xl" />
        <Skeleton height={42} className="rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {/* NEW USERS */}
      <div className="p-2 sm:p-2.5 px-3 rounded-xl bg-[var(--card)]/60 border border-[var(--border)] flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <UserPlus size={15} className="text-blue-500 shrink-0" />
          <span className="text-xs font-bold text-[var(--foreground)]">New Users</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          {periods.map((p, idx) => (
            <div key={p.key} className="flex items-center gap-2.5">
              {idx > 0 && <div className="h-3.5 w-[1px] bg-[var(--border)]" />}
              <div className="text-right">
                <span className="text-[8px] text-[var(--muted)] block font-semibold leading-none mb-0.5">{p.label}</span>
                <span className="font-bold text-xs text-[var(--foreground)] leading-none">{stats[p.key]?.newUsers ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE USERS */}
      <div className="p-2 sm:p-2.5 px-3 rounded-xl bg-[var(--card)]/60 border border-[var(--border)] flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-[var(--foreground)]">Active Users</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          {periods.map((p, idx) => (
            <div key={p.key} className="flex items-center gap-2.5">
              {idx > 0 && <div className="h-3.5 w-[1px] bg-[var(--border)]" />}
              <div className="text-right">
                <span className="text-[8px] text-[var(--muted)] block font-semibold leading-none mb-0.5">{p.label}</span>
                <span className="font-bold text-xs text-[var(--foreground)] leading-none">{stats[p.key]?.activeUsers ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
