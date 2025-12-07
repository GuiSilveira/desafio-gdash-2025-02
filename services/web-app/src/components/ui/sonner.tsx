import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast: "!rounded-2xl !shadow-lg font-sans",
          title: "!font-semibold !text-sm",
          description: "!text-sm",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
