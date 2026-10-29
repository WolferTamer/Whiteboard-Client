// A Code Entry field/submit button that allows the user to choose a code to use for their room. It is 8 digit alphanumeric.

import { useState } from "react";

interface CodeEntryProps {
  onCodeSubmitted: (value: string) => void;
  error: string | null;
  disabled: boolean;
}

// If the room already exists, they will enter it. If it doesn't, a new room will be created.
export default function CodeEntry({
  onCodeSubmitted,
  error,
  disabled,
}: CodeEntryProps) {
  const [code, setCode] = useState("");
  return (
    <div className="flex flex-col gap-4 m-3 items-center ">
      <input
        type="text"
        placeholder="Hm..."
        className="p-2 border border-slate-500 rounded-lg focus:border-slate-300"
        disabled={disabled}
        value={code}
        onChange={(v) => setCode(v.currentTarget.value)}
      />
      <button
        className="p-2 rounded-xl bg-green-300 text-black hover:bg-green-500 hover:cursor-pointer "
        disabled={disabled}
        onClick={() => onCodeSubmitted(code)}
      >
        Join or Create
      </button>
      <div>{error ?? ""}</div>
    </div>
  );
}
