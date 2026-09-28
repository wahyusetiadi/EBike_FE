import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/api";
import logo from "../../assets/logo.svg";
import "./style.css";

const shouldShowDemoAccount = () => {
  const demoFlag = import.meta.env.VITE_SHOW_DEMO_CREDENTIALS;
  if (demoFlag === "true") return true;
  if (demoFlag === "false") return false;

  const flag = import.meta.env.VITE_USE_MOCK;
  if (flag === "true") return true;
  if (flag === "false") return false;

  return !import.meta.env.VITE_BASE_URL;
};

const DEMO_ACCOUNTS = [
  { label: "Owner", username: "owner", password: "owner" },
  { label: "Admin", username: "admin", password: "admin" },
];

export const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const doLogin = async (u, p) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginUser(u, p);
      if (response?.data) {
        localStorage.setItem("token", response.data);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await doLogin(username, password);
  };

  const selectDemoAccount = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setError(null);
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Login E-Bike Management">
        <aside className="auth-brand-panel">
          <div className="auth-brand-top">
            <div className="auth-brand-logo">
              <img src={logo} alt="" />
            </div>
            <div>
              <p className="auth-brand-name">E-Bike</p>
              <p className="auth-brand-caption">MANAGEMENT</p>
            </div>
          </div>

          <div className="auth-brand-copy">
            <span className="auth-eyebrow"><span /> PLATFORM MANAJEMEN TOKO</span>
            <h1>Semua operasional, <em>lebih mudah.</em></h1>
            <p>Kelola produk, transaksi, dan pelanggan dalam satu tempat yang praktis.</p>
          </div>

          <div className="auth-brand-footer">
            <span className="auth-status-dot" /> Sistem manajemen E-Bike
          </div>
          <div className="auth-brand-orbit auth-brand-orbit-one" />
          <div className="auth-brand-orbit auth-brand-orbit-two" />
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-mobile-brand">
              <img src={logo} alt="" />
              <span>E-Bike <b>Management</b></span>
            </div>

            <header className="auth-heading">
              <p className="auth-heading-kicker">SELAMAT DATANG KEMBALI</p>
              <h2>Masuk ke akun Anda</h2>
              <p>Masukkan detail akun untuk melanjutkan.</p>
            </header>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="username">Username</label>
                <div className="auth-input-wrap">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></svg>
                  <input
                    id="username"
                    name="username"
                    autoComplete="username"
                    required
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrap">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" /></svg>
                  <input
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {error && <p className="auth-error" role="alert">{error}</p>}

              <button className="auth-submit" type="submit" disabled={loading}>
                <span>{loading ? "Memproses..." : "Masuk"}</span>
                {!loading && <span className="auth-submit-arrow" aria-hidden="true">→</span>}
              </button>
            </form>

            {shouldShowDemoAccount() && (
              <div className="auth-demo">
                <p className="auth-demo-title">Akun demo <span>• pilih untuk isi otomatis</span></p>
                <div className="auth-demo-list">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.username}
                      type="button"
                      className="auth-demo-account"
                      onClick={() => selectDemoAccount(account)}
                    >
                      <span className="auth-demo-avatar">{account.label.charAt(0)}</span>
                      <span className="auth-demo-details">
                        <b>{account.label}</b>
                        <small>{account.username} / {account.password}</small>
                      </span>
                      <span className="auth-demo-arrow" aria-hidden="true">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="auth-form-footer">© {new Date().getFullYear()} E-Bike Management</p>
          </div>
        </div>
      </section>
    </main>
  );
};
