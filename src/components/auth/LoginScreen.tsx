import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

type Mode = "login" | "register";

export const LoginScreen = React.memo(() => {
  const [mode, setMode] = useState<Mode>("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ------------------------------------------------------------
  // Convert username into an internal email for Supabase Auth
  // ------------------------------------------------------------
  const getInternalEmail = (value: string) => {
    return `${value.trim().toLowerCase()}@f1.local`;
  };

  // ------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanUsername = username.trim().toLowerCase();

    // Username validation
    if (!cleanUsername) {
      setError("Please enter a username.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (cleanUsername.length > 20) {
      setError("Username must be 20 characters or less.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError("Username can only contain letters, numbers and underscores.");
      return;
    }

    // Password validation
    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const internalEmail = getInternalEmail(cleanUsername);

      // ==========================================================
      // REGISTER
      // ==========================================================
      if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: internalEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (!data.user) {
          throw new Error("Unable to create account.");
        }

        setSuccess("Account created successfully.");

        setUsername("");
        setPassword("");

        // Because email confirmation is disabled,
        // Supabase should automatically create the session.
        return;
      }

      // ==========================================================
      // LOGIN
      // ==========================================================
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: internalEmail,
        password,
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err: any) {
      console.error("Authentication error:", err);

      if (err?.message?.toLowerCase().includes("invalid login credentials")) {
        setError("Invalid username or password.");
      } else if (err?.message?.toLowerCase().includes("already registered")) {
        setError("That username is already taken.");
      } else {
        setError(err?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#080808] px-4">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0">
        {/* Horizontal lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "100% 36px",
          }}
        />

        {/* Diagonal texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 6px)",
          }}
        />

        {/* Red glow */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#e10600]/10 blur-[150px]" />
      </div>

      {/* =========================================================
          LOGIN PANEL
      ========================================================= */}
      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-[#e10600]" />

            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
              Formula Racing
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <h1 className="text-4xl font-black uppercase italic leading-none tracking-[-0.05em] text-white">
            {mode === "login" ? (
              <>
                Welcome
                <br />
                <span className="text-[#e10600]">Back</span>
              </>
            ) : (
              <>
                Create
                <br />
                <span className="text-[#e10600]">Driver</span>
              </>
            )}
          </h1>

          <p className="mt-2 text-[8px] uppercase tracking-[0.16em] text-white/30">
            {mode === "login"
              ? "Enter the grid"
              : "Create your racing identity"}
          </p>
        </div>

        {/* =======================================================
            FORM
        ======================================================= */}
        <form
          onSubmit={handleSubmit}
          className="border border-white/10 bg-white/[0.025] p-4 sm:p-5"
        >
          {/* Username */}
          <div className="mb-3">
            <label className="mb-1.5 block text-[7px] font-bold uppercase tracking-[0.18em] text-white/40">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="ENTER USERNAME"
              autoComplete="username"
              maxLength={20}
              disabled={loading}
              className="
                h-10
                w-full
                border
                border-white/10
                bg-black/40
                px-3
                text-[10px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-white
                outline-none
                placeholder:text-white/15
                focus:border-[#e10600]
                disabled:opacity-50
              "
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[7px] font-bold uppercase tracking-[0.18em] text-white/40">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="ENTER PASSWORD"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              disabled={loading}
              className="
                h-10
                w-full
                border
                border-white/10
                bg-black/40
                px-3
                text-[10px]
                font-bold
                tracking-[0.1em]
                text-white
                outline-none
                placeholder:text-white/15
                focus:border-[#e10600]
                disabled:opacity-50
              "
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 border border-[#e10600]/30 bg-[#e10600]/10 px-3 py-2">
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#e10600]">
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-3 border border-green-500/20 bg-green-500/10 px-3 py-2">
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-green-400">
                {success}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              flex
              h-11
              w-full
              items-center
              justify-between
              bg-[#e10600]
              px-4
              text-white
              transition
              hover:bg-[#b80500]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">
              {loading
                ? "Please Wait..."
                : mode === "login"
                  ? "Enter Grid"
                  : "Create Account"}
            </span>

            <span className="text-lg font-black">→</span>
          </button>
        </form>

        {/* =======================================================
            SWITCH MODE
        ======================================================= */}
        <div className="mt-3 text-center">
          <span className="text-[7px] uppercase tracking-[0.12em] text-white/25">
            {mode === "login"
              ? "Don't have a driver account?"
              : "Already have a driver account?"}
          </span>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setSuccess("");
              setPassword("");
            }}
            className="ml-2 text-[7px] font-black uppercase tracking-[0.12em] text-[#e10600] hover:text-white"
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-white/10" />

          <span className="text-[6px] uppercase tracking-[0.2em] text-white/15">
            formula X
          </span>

          <div className="h-px w-8 bg-white/10" />
        </div>
      </div>
    </div>
  );
});
