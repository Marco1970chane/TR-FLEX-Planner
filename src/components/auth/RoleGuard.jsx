import useAuth from "../../hooks/useAuth";

export default function RoleGuard({
  roles = [],
  children,
  fallback = null,
}) {
  const { profile, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!profile) {
    return fallback;
  }

  // Nieuw: account is gedeactiveerd
  if (!profile.actief) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>Account gedeactiveerd</h2>
        <p>
          Neem contact op met een beheerder.
        </p>
      </div>
    );
  }

  if (roles.length === 0) {
    return children;
  }

  if (!roles.includes(profile.rol)) {
    return fallback;
  }

  return children;
}