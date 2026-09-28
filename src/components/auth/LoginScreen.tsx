import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "Account created! Check your email if confirmation is required.",
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: "4px",
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            <span style={{ color: "#e10600" }}>F1</span>
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              letterSpacing: "6px",
              color: "#777777",
              textTransform: "uppercase",
            }}
          >
            Racing
          </div>
        </div>

        {/* CARD */}
        <div
          style={{
            background: "#0d0d0d",
            border: "1px solid #242424",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          <h2
            style={{
              margin: "0 0 8px 0",
              color: "#ffffff",
              fontSize: "26px",
              fontWeight: 700,
            }}
          >
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>

          <p
            style={{
              margin: "0 0 28px 0",
              color: "#888888",
              fontSize: "14px",
            }}
          >
            {isRegistering
              ? "Create an account to save your race progress."
              : "Sign in to continue racing."}
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* EMAIL */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "#cccccc",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                EMAIL
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "48px",
                  boxSizing: "border-box",
                  padding: "0 14px",
                  background: "#161616",
                  border: "1px solid #333333",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "#cccccc",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                PASSWORD
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: "100%",
                  height: "48px",
                  boxSizing: "border-box",
                  padding: "0 14px",
                  background: "#161616",
                  border: "1px solid #333333",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "rgba(225, 6, 0, 0.12)",
                  border: "1px solid rgba(225, 6, 0, 0.35)",
                  color: "#ff4d4d",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {message && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "rgba(0, 180, 100, 0.12)",
                  border: "1px solid rgba(0, 180, 100, 0.35)",
                  color: "#4ade80",
                  fontSize: "13px",
                }}
              >
                {message}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "50px",
                marginTop: "4px",
                border: "none",
                borderRadius: "8px",
                background: loading ? "#555555" : "#e10600",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 800,
                letterSpacing: "1px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? "PLEASE WAIT..."
                : isRegistering
                  ? "CREATE ACCOUNT"
                  : "LOGIN"}
            </button>
          </form>

          {/* REGISTER / LOGIN */}
          <div
            style={{
              marginTop: "25px",
              paddingTop: "22px",
              borderTop: "1px solid #222222",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                color: "#777777",
                fontSize: "13px",
              }}
            >
              {isRegistering
                ? "Already have an account?"
                : "Don't have an account?"}
            </p>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
                setMessage("");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#e10600",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                padding: "5px",
              }}
            >
              {isRegistering ? "LOGIN INSTEAD" : "CREATE AN ACCOUNT"}
            </button>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#555555",
            fontSize: "11px",
          }}
        >
          Your race progress will be saved to your account.
        </p>
      </div>
    </div>
  );
}
