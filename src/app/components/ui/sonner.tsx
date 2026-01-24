import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group !bg-black !text-[#00ff41] !border-[#00ff41] !border !rounded-none !font-mono !shadow-[0_0_10px_rgba(0,255,65,0.3)]",
          description: "group-[.toast]:!text-[#00ff41]/70 !font-mono",
          actionButton:
            "group-[.toast]:!bg-[#00ff41] group-[.toast]:!text-black group-[.toast]:!font-bold !rounded-none !font-mono",
          cancelButton:
            "group-[.toast]:!bg-black group-[.toast]:!text-[#00ff41] group-[.toast]:!border-[#00ff41] group-[.toast]:!border !rounded-none !font-mono",
          error: "!text-red-500 !border-red-500 !shadow-[0_0_10px_rgba(239,68,68,0.3)]",
          success: "!text-[#00ff41] !border-[#00ff41]",
          warning: "!text-yellow-500 !border-yellow-500",
          info: "!text-blue-500 !border-blue-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
