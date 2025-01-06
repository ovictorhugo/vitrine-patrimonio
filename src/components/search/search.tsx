import { MagnifyingGlass } from "phosphor-react";
import { Alert } from "../ui/alert";

export function Search() {
    return(
        <Alert className="h-14 p-2  mt-4 mb-2  flex items-center justify-between max-w-[60vw]">
        <div className="flex items-center gap-2 w-full flex-1">
          <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
        </div>
      </Alert>
    )
}