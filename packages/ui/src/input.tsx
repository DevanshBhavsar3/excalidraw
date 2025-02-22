import { ChangeEvent, type JSX } from "react";

interface InputProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function Input({ onChange }: InputProps): JSX.Element {
  return <input type="text" onChange={onChange} />;
}
