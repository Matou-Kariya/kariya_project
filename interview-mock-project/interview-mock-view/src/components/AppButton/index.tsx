import { Button } from "antd";
import type { ButtonProps } from "antd";
import "./index.css";

type AppButtonTone = "primary" | "default" | "soft" | "danger";

type AppButtonProps = Omit<ButtonProps, "variant"> & {
  tone?: AppButtonTone;
};

export function AppButton({ tone = "default", className, children, ...props }: AppButtonProps) {
  const mergedClassName = ["app-button", `app-button--${tone}`, className].filter(Boolean).join(" ");

  return (
    <Button className={mergedClassName} {...props}>
      {children}
    </Button>
  );
}
