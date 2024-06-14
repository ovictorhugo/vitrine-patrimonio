import { ThemeProvider } from "../components/provider/theme-provider";
import { cn } from "../lib/utils";
import { ModalProvider } from "../components/provider/modal-provider";

export default function DefaultLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return(
        <body className={cn(
            " bg-neutral-50 dark:bg-neutral-900 "
            )}>
            <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={true}
            storageKey="fump-theme"
            >
              <ModalProvider/>
            {children}
            </ThemeProvider>
            
             
            </body>
    )
}