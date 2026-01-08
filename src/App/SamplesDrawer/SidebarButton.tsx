import { Button } from "@mui/material";
import { ReactNode } from "react";

type SidebarButtonProps = {
  href?: string;
  children: ReactNode;
  onClick?: () => void;
};

export default function SidebarButton({
  href,
  children,
  onClick,
}: SidebarButtonProps) {
  return (
    <Button
      component={href ? "a" : "button"}
      href={href}
      onClick={onClick}
      fullWidth
      sx={{
        justifyContent: "flex-start",
        textTransform: "none",
        alignItems: "flex-start",
        px: 1,
      }}
    >
      {children}
    </Button>
  );
}
