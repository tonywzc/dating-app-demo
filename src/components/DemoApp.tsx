"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { AnimatePresence } from "motion/react";
import { DEFAULT_MUSE, PRIMARY_ACCOUNT, PROFILE_PREFILL, type Account } from "@/lib/mock-data";
import { ageFrom } from "@/lib/format";
import { PhoneFrame } from "@/components/device/PhoneFrame";
import { SplashScreen } from "@/components/onboarding/SplashScreen";
import { AccountPicker } from "@/components/onboarding/AccountPicker";
import { SwitchAccountSheet } from "@/components/onboarding/SwitchAccountSheet";
import { ConnectSheet } from "@/components/onboarding/ConnectSheet";
import { LegalSheet, type LegalDoc } from "@/components/onboarding/LegalSheet";
import { InstagramChooser } from "@/components/onboarding/InstagramChooser";
import { SettingUp } from "@/components/onboarding/SettingUp";
import { AllSet } from "@/components/onboarding/AllSet";
import { DemoEnd } from "@/components/onboarding/DemoEnd";
import { PermissionsFlow } from "@/components/permissions/PermissionsFlow";
import { AboutYou } from "@/components/profile/AboutYou";
import { MuseFlow } from "@/components/muse/MuseFlow";
import { StoriesFlow } from "@/components/photos/StoriesFlow";
import { SAMPLE_ANSWERS, summarize, type Summary } from "@/lib/muse-script";
import type { ProfileBasics } from "@/components/muse/MuseResult";

type Screen = "splash" | "accounts" | "settingUp" | "permissions" | "allSet" | "about" | "muse" | "stories" | "end";
type SheetName = "switch" | "connect" | LegalDoc;

const noop = () => () => {};

const SCREENS: Screen[] = ["splash", "accounts", "settingUp", "permissions", "allSet", "about", "muse", "stories", "end"];

const prefill = (id: string) => [...PROFILE_PREFILL.basics, ...PROFILE_PREFILL.life].find((f) => f.id === id)?.value ?? "";

/** Profile basics before the user has reviewed "About you" (e.g. when jumping in with `?start=muse`). */
const DEFAULT_PROFILE: ProfileBasics = {
  firstName: prefill("name"),
  age: ageFrom(prefill("birthday")),
  location: prefill("location"),
};

/** Muse's summary before the user has talked to Muse (e.g. `?start=stories`). */
const DEFAULT_SUMMARY: Summary = summarize(SAMPLE_ANSWERS);

/** `?start=permissions` jumps straight to a screen (for reviews and demos). */
function startScreen(): Screen {
  const start = new URLSearchParams(window.location.search).get("start") as Screen | null;
  return start && SCREENS.includes(start) ? start : "splash";
}

/** The demo is purely client-side (animation math, timers), so skip SSR. */
export function DemoApp() {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return mounted ? <Onboarding /> : <div className="stage" />;
}

function Onboarding() {
  const [run, setRun] = useState(0);
  const [screen, setScreen] = useState<Screen>(startScreen);
  const [sheet, setSheet] = useState<SheetName | null>(null);
  const [igLogin, setIgLogin] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([PRIMARY_ACCOUNT]);
  const [selected, setSelected] = useState(PRIMARY_ACCOUNT.username);
  const [pending, setPending] = useState<"continue" | "confirm" | null>(null);
  const [profile, setProfile] = useState<ProfileBasics | null>(null);
  const [skippedPermissions, setSkippedPermissions] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  const account = accounts.find((a) => a.username === selected) ?? accounts[0];
  const name = profile?.firstName ?? account.displayName;

  const finishSplash = useCallback(() => setScreen((s) => (s === "splash" ? "accounts" : s)), []);
  const finishSetup = useCallback(() => setScreen("permissions"), []);
  const finishPermissions = useCallback(() => {
    setSkippedPermissions(false);
    setScreen("allSet");
  }, []);
  const skipPermissions = useCallback(() => {
    setSkippedPermissions(true);
    setScreen("allSet");
  }, []);
  const finishAllSet = useCallback(() => setScreen((s) => (s === "allSet" ? "about" : s)), []);

  const continueWithAccount = () => {
    setPending("continue");
    setTimeout(() => {
      setPending(null);
      setSheet("connect");
    }, 650);
  };

  const confirmConnect = () => {
    setPending("confirm");
    setTimeout(() => {
      setPending(null);
      setSheet(null);
      setScreen("settingUp");
    }, 900);
  };

  const addAccount = (added: Account) => {
    setAccounts((list) => (list.some((a) => a.username === added.username) ? list : [...list, added]));
    setSelected(added.username);
    setIgLogin(false);
    setSheet("connect");
  };

  const replay = () => {
    setSheet(null);
    setIgLogin(false);
    setProfile(null);
    setScreen("splash");
    setRun((r) => r + 1);
  };

  return (
    <PhoneFrame tone={igLogin ? "dark" : "light"}>
      <AnimatePresence>
        {screen === "splash" && <SplashScreen key={`splash-${run}`} onDone={finishSplash} />}
        {screen === "accounts" && (
          <AccountPicker
            key="accounts"
            account={account}
            continuing={pending === "continue"}
            onContinue={continueWithAccount}
            onSwitch={() => setSheet("switch")}
            onLegal={setSheet}
          />
        )}
        {screen === "settingUp" && <SettingUp key="settingUp" account={account} onDone={finishSetup} />}
        {screen === "permissions" && <PermissionsFlow key="permissions" onComplete={finishPermissions} onSkip={skipPermissions} />}
        {screen === "allSet" && <AllSet key="allSet" name={name} skipped={skippedPermissions} onDone={finishAllSet} />}
        {screen === "about" && (
          <AboutYou
            key="about"
            onDone={(basics) => {
              setProfile(basics);
              setScreen("muse");
            }}
          />
        )}
        {screen === "muse" && (
          <MuseFlow
            key="muse"
            account={account}
            profile={profile ?? DEFAULT_PROFILE}
            onDone={(result) => {
              setSummary(result);
              setScreen("stories");
            }}
          />
        )}
        {screen === "stories" && (
          <StoriesFlow
            key="stories"
            muse={account.muse ?? DEFAULT_MUSE}
            profile={profile ?? DEFAULT_PROFILE}
            summary={summary ?? DEFAULT_SUMMARY}
            onDone={() => setScreen("end")}
          />
        )}
        {screen === "end" && <DemoEnd key="end" onReplay={replay} />}
      </AnimatePresence>

      <SwitchAccountSheet
        open={sheet === "switch"}
        accounts={accounts}
        selected={selected}
        onSelect={(username) => {
          setSelected(username);
          setSheet(null);
        }}
        onAddAccount={() => {
          setSheet(null);
          setIgLogin(true);
        }}
        onClose={() => setSheet(null)}
      />
      <ConnectSheet
        open={sheet === "connect"}
        account={account}
        confirming={pending === "confirm"}
        onConfirm={confirmConnect}
        onClose={() => pending !== "confirm" && setSheet(null)}
      />
      <LegalSheet doc={sheet === "terms" || sheet === "privacy" ? sheet : null} onClose={() => setSheet(null)} />

      <AnimatePresence>
        {igLogin && <InstagramChooser key="ig" onBack={() => setIgLogin(false)} onChoose={addAccount} />}
      </AnimatePresence>
    </PhoneFrame>
  );
}
