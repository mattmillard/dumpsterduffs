"use client";

import { useEffect, useMemo, useState } from "react";

type RegisteredUser = {
	id: string;
	email: string;
	created_at: string;
	email_confirmed_at: string | null;
	last_sign_in_at: string | null;
	full_name: string;
	role: "owner" | "admin" | "dispatcher" | null;
	is_active_admin: boolean;
	can_promote: boolean;
};

type HealthResponse = {
	status: "healthy" | "degraded";
	checked_at: string;
	env: Array<{
		key: string;
		present: boolean;
		required: boolean;
	}>;
	services: {
		database: {
			reachable: boolean;
			error: string | null;
		};
	};
};

export default function AdminSettingsPage() {
	const [users, setUsers] = useState<RegisteredUser[]>([]);
	const [usersLoading, setUsersLoading] = useState(true);
	const [usersError, setUsersError] = useState<string | null>(null);
	const [health, setHealth] = useState<HealthResponse | null>(null);
	const [healthLoading, setHealthLoading] = useState(true);
	const [healthError, setHealthError] = useState<string | null>(null);
	const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<string | null>(null);
	const [search, setSearch] = useState("");

	const handleSignOut = () => {
		localStorage.removeItem("admin_demo_auth");
		window.location.assign("/auth/signout");
	};

	const loadUsers = async () => {
		setUsersLoading(true);
		setUsersError(null);

		try {
			const response = await fetch("/api/admin/users", { cache: "no-store" });
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.error || "Failed to load users");
			}

			setUsers(data.users || []);
		} catch (error) {
			console.error("Failed to fetch users:", error);
			setUsersError("Unable to load registered users.");
		} finally {
			setUsersLoading(false);
		}
	};

	const loadHealth = async () => {
		setHealthLoading(true);
		setHealthError(null);

		try {
			const response = await fetch("/api/admin/health", { cache: "no-store" });
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.error || "Failed to run health checks");
			}

			setHealth(data);
		} catch (error) {
			console.error("Failed to fetch health:", error);
			setHealthError("Unable to run environment health checks.");
		} finally {
			setHealthLoading(false);
		}
	};

	useEffect(() => {
		loadUsers();
		loadHealth();
	}, []);

	const promoteToAdmin = async (user: RegisteredUser) => {
		setFeedback(null);
		setUpdatingUserId(user.id);

		try {
			const response = await fetch("/api/admin/users", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: user.id }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.error || "Failed to update user");
			}

			setFeedback(`${user.email} now has admin access.`);
			await loadUsers();
		} catch (error) {
			console.error("Failed to promote user:", error);
			setFeedback(`Could not update ${user.email}.`);
		} finally {
			setUpdatingUserId(null);
		}
	};

	const filteredUsers = useMemo(() => {
		const term = search.trim().toLowerCase();

		if (!term) {
			return users;
		}

		return users.filter((user) => {
			const roleText = user.role || "not-admin";
			return (
				user.email.toLowerCase().includes(term) ||
				user.full_name.toLowerCase().includes(term) ||
				roleText.toLowerCase().includes(term)
			);
		});
	}, [users, search]);

	const envRows = health?.env || [];
	const missingRequired = envRows.filter((item) => item.required && !item.present);

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-4xl font-bold text-white">Settings</h1>
					<p className="text-[#999999] mt-2">Manage registered users and monitor system health</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={handleSignOut}
						className="px-4 py-2 rounded-md bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20">
						Sign Out
					</button>
					<button
						onClick={loadUsers}
						className="px-4 py-2 rounded-md bg-[#262626] text-white border border-[#404040] hover:bg-[#303030]">
						Refresh Users
					</button>
					<button
						onClick={loadHealth}
						className="px-4 py-2 rounded-md bg-[#262626] text-white border border-[#404040] hover:bg-[#303030]">
						Refresh Health
					</button>
				</div>
			</div>

			{feedback && (
				<div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
					<p className="text-primary text-sm">{feedback}</p>
				</div>
			)}

			<section className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-6 space-y-4">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
					<div>
						<h2 className="text-2xl font-bold text-white">Registered Users</h2>
						<p className="text-[#999999] text-sm mt-1">
							Promote registered accounts to admin access without opening Supabase
						</p>
					</div>
					<input
						type="search"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search by email, name, or role"
						className="input-field w-full md:w-80"
					/>
				</div>

				{usersLoading ? (
					<p className="text-[#999999]">Loading users...</p>
				) : usersError ? (
					<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
						<p className="text-red-300 text-sm">{usersError}</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm min-w-[900px]">
							<thead>
								<tr className="text-left text-[#999999] border-b border-[#404040]">
									<th className="pb-3 pr-4">Email</th>
									<th className="pb-3 pr-4">Name</th>
									<th className="pb-3 pr-4">Role</th>
									<th className="pb-3 pr-4">Auth Status</th>
									<th className="pb-3 pr-4">Last Sign In</th>
									<th className="pb-3">Action</th>
								</tr>
							</thead>
							<tbody>
								{filteredUsers.map((user) => {
									const roleLabel = user.role || "Not Admin";
									const roleClass =
										user.role === "owner"
											? "bg-primary/20 text-primary"
											: user.role === "admin"
												? "bg-[#4ADE80]/20 text-[#4ADE80]"
												: user.role === "dispatcher"
													? "bg-[#F59E0B]/20 text-[#F59E0B]"
													: "bg-[#404040] text-[#D4D4D4]";

									return (
										<tr key={user.id} className="border-b border-[#262626] text-white">
											<td className="py-3 pr-4">{user.email}</td>
											<td className="py-3 pr-4">{user.full_name || "-"}</td>
											<td className="py-3 pr-4">
												<span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleClass}`}>{roleLabel}</span>
											</td>
											<td className="py-3 pr-4">
												{user.email_confirmed_at ? (
													<span className="text-[#4ADE80]">Confirmed</span>
												) : (
													<span className="text-[#F59E0B]">Pending</span>
												)}
											</td>
											<td className="py-3 pr-4 text-[#999999]">
												{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}
											</td>
											<td className="py-3">
												{user.can_promote ? (
													<button
														onClick={() => promoteToAdmin(user)}
														disabled={updatingUserId === user.id}
														className="px-3 py-1.5 rounded-md bg-primary text-white disabled:opacity-60 hover:opacity-90">
														{updatingUserId === user.id ? "Updating..." : "Set As Admin"}
													</button>
												) : (
													<span className="text-[#4ADE80] text-xs font-semibold">Admin Access Enabled</span>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						{filteredUsers.length === 0 && <p className="text-[#999999] text-sm py-4">No matching users found.</p>}
					</div>
				)}
			</section>

			<section className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-6 space-y-4">
				<div id="account" className="scroll-mt-24">
					<h2 className="text-2xl font-bold text-white">Account</h2>
					<p className="text-[#999999] text-sm mt-1">Manage your current admin session</p>
				</div>

				<div className="bg-[#121212] border border-[#303030] rounded-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<p className="text-white font-medium">Sign out of Admin</p>
						<p className="text-[#999999] text-sm">Ends your current session on this device</p>
					</div>
					<button
						onClick={handleSignOut}
						className="px-4 py-2 rounded-md bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 sm:w-auto w-full">
						Log Out
					</button>
				</div>
			</section>

			<section className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-6 space-y-4">
				<div>
					<h2 className="text-2xl font-bold text-white">System Health</h2>
					<p className="text-[#999999] text-sm mt-1">Quick environment checks to catch deployment misconfiguration</p>
				</div>

				{healthLoading ? (
					<p className="text-[#999999]">Running health checks...</p>
				) : healthError ? (
					<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
						<p className="text-red-300 text-sm">{healthError}</p>
					</div>
				) : health ? (
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<span
								className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
									health.status === "healthy" ? "bg-[#4ADE80]/20 text-[#4ADE80]" : "bg-[#F59E0B]/20 text-[#F59E0B]"
								}`}>
								{health.status === "healthy" ? "Healthy" : "Degraded"}
							</span>
							<span className="text-[#999999] text-sm">Checked {new Date(health.checked_at).toLocaleString()}</span>
						</div>

						{!health.services.database.reachable && (
							<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
								<p className="text-red-300 text-sm">
									Database check failed: {health.services.database.error || "Unknown error"}
								</p>
							</div>
						)}

						{missingRequired.length > 0 && (
							<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
								<p className="text-red-300 text-sm">
									Missing required variables: {missingRequired.map((item) => item.key).join(", ")}
								</p>
							</div>
						)}

						<div className="grid md:grid-cols-2 gap-3">
							{envRows.map((item) => (
								<div
									key={item.key}
									className="flex items-center justify-between bg-[#121212] border border-[#303030] rounded-md px-3 py-2">
									<span className="text-white text-sm">{item.key}</span>
									<span
										className={`text-xs font-semibold ${
											item.present ? "text-[#4ADE80]" : item.required ? "text-red-300" : "text-[#F59E0B]"
										}`}>
										{item.present ? "Present" : item.required ? "Missing" : "Optional"}
									</span>
								</div>
							))}
						</div>
					</div>
				) : null}
			</section>
		</div>
	);
}
